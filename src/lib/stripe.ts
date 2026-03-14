import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

// Coin packages available for purchase
export const COIN_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    coins: 100,
    price: 1000, // in cents = $10
    stripePriceId: 'price_starter', // replace with real Stripe Price ID
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    coins: 300,
    price: 2500, // $25
    stripePriceId: 'price_growth',
    popular: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    coins: 1000,
    price: 7000, // $70
    stripePriceId: 'price_agency',
    popular: false,
  },
] as const

// 1 app test = 100 coins
export const COINS_PER_TEST = 100
