// ─── Database types (mirrors Supabase schema) ────────────────────────────────

export type UserRole = 'developer' | 'admin'
export type OrderStatus = 'pending' | 'active' | 'completed' | 'failed' | 'refunded'
export type CoinTxType = 'purchase' | 'spend' | 'refund' | 'bonus'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  coins: number
  created_at: string
  updated_at: string
}

export interface CoinTransaction {
  id: string
  user_id: string
  type: CoinTxType
  amount: number           // positive = credit, negative = debit
  balance_after: number
  description: string
  stripe_payment_id: string | null
  order_id: string | null
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  app_name: string
  play_store_url: string
  package_name: string
  status: OrderStatus
  coins_spent: number
  testers_required: number  // default 12
  testers_active: number
  started_at: string | null
  ends_at: string | null
  report_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Tester {
  id: string
  telegram_id: string
  name: string
  country: string | null
  is_active: boolean
  total_tests: number
  joined_at: string
}

export interface OrderTester {
  id: string
  order_id: string
  tester_id: string
  joined_at: string
  last_active_at: string | null
  is_confirmed: boolean
}

// ─── Supabase Database type map ───────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      coin_transactions: {
        Row: CoinTransaction
        Insert: Omit<CoinTransaction, 'id' | 'created_at'>
        Update: never
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      testers: {
        Row: Tester
        Insert: Omit<Tester, 'id' | 'joined_at'>
        Update: Partial<Omit<Tester, 'id' | 'joined_at'>>
      }
      order_testers: {
        Row: OrderTester
        Insert: Omit<OrderTester, 'id'>
        Update: Partial<Omit<OrderTester, 'id'>>
      }
    }
  }
}

// ─── App-level types ──────────────────────────────────────────────────────────

export type Locale = 'en' | 'ko' | 'ru' | 'uz'

export interface CoinPackage {
  id: string
  name: string
  coins: number
  price: number       // cents
  stripePriceId: string
  popular: boolean
}
