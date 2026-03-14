# QA12

**Get 12 testers. Ship faster.**

Google Play closed testing service — 13,000+ testers, coin-based payments, guaranteed production access.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS) |
| Payments | Stripe (Checkout + Webhooks) |
| Deployment | Vercel |

---

## Project Structure

```
qa12/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── orders/               # My orders
│   │   │   └── coins/                # Buy coins / history
│   │   ├── admin/                    # Admin panel
│   │   └── api/
│   │       ├── webhooks/stripe/      # Stripe webhook
│   │       ├── coins/checkout/       # Create Stripe session
│   │       └── orders/               # Create order
│   ├── components/
│   │   ├── ui/                       # Buttons, inputs, cards
│   │   ├── layout/                   # Navbar, footer
│   │   └── dashboard/                # Dashboard components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   └── server.ts             # Server + admin client
│   │   └── stripe.ts                 # Stripe + coin packages
│   ├── hooks/                        # Custom React hooks
│   └── types/
│       └── index.ts                  # All TypeScript types
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql   # Full DB schema + RLS
└── .env.example
```

---

## Coin System

| Package | Coins | Price | Tests |
|---------|-------|-------|-------|
| Starter | 100 | $10 | 1 app |
| Growth | 300 | $25 | 3 apps |
| Agency | 1000 | $70 | 10 apps |

**1 test = 100 coins**

---

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Copy env file
cp .env.example .env.local
# Fill in Supabase + Stripe keys

# 3. Run Supabase migration
supabase db push

# 4. Start dev server
npm run dev
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Roadmap

- [x] Project structure
- [x] Supabase schema + RLS policies
- [x] Stripe checkout + webhook
- [x] Coin purchase flow
- [x] Order creation API
- [ ] Auth pages (login/register)
- [ ] Dashboard UI
- [ ] Admin panel
- [ ] Landing page (Next.js components)
- [ ] i18n (EN/KO/RU/UZ)
- [ ] Email notifications
