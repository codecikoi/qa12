-- ─────────────────────────────────────────────────────────────
-- QA12 — Initial Schema
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  avatar_url   text,
  role         text not null default 'developer' check (role in ('developer', 'admin')),
  coins        integer not null default 0 check (coins >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── COIN TRANSACTIONS ───────────────────────────────────────
create table public.coin_transactions (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  type               text not null check (type in ('purchase', 'spend', 'refund', 'bonus')),
  amount             integer not null,        -- positive = credit, negative = debit
  balance_after      integer not null,
  description        text not null,
  stripe_payment_id  text,
  order_id           uuid,
  created_at         timestamptz not null default now()
);

-- ─── ORDERS ──────────────────────────────────────────────────
create table public.orders (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  app_name          text not null,
  play_store_url    text not null,
  package_name      text not null,
  status            text not null default 'pending'
                    check (status in ('pending', 'active', 'completed', 'failed', 'refunded')),
  coins_spent       integer not null default 100,
  testers_required  integer not null default 12,
  testers_active    integer not null default 0,
  started_at        timestamptz,
  ends_at           timestamptz,
  report_url        text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── TESTERS ─────────────────────────────────────────────────
create table public.testers (
  id           uuid primary key default uuid_generate_v4(),
  telegram_id  text not null unique,
  name         text not null,
  country      text,
  is_active    boolean not null default true,
  total_tests  integer not null default 0,
  joined_at    timestamptz not null default now()
);

-- ─── ORDER TESTERS (junction) ────────────────────────────────
create table public.order_testers (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  tester_id      uuid not null references public.testers(id),
  joined_at      timestamptz not null default now(),
  last_active_at timestamptz,
  is_confirmed   boolean not null default false,
  unique(order_id, tester_id)
);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.orders          enable row level security;
alter table public.testers         enable row level security;
alter table public.order_testers   enable row level security;

-- Profiles: users can read/update own profile
create policy "users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Admin can see all profiles
create policy "admin can view all profiles"
  on public.profiles for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Coin transactions: users see own
create policy "users can view own transactions"
  on public.coin_transactions for select using (auth.uid() = user_id);

-- Orders: users see own orders
create policy "users can view own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "users can insert own orders"
  on public.orders for insert with check (auth.uid() = user_id);

-- Admin sees all orders
create policy "admin can manage orders"
  on public.orders for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Testers: admin only
create policy "admin can manage testers"
  on public.testers for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Order testers: users can see testers on their orders
create policy "users can view own order testers"
  on public.order_testers for select
  using (exists (
    select 1 from public.orders where id = order_id and user_id = auth.uid()
  ));
