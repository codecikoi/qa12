import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, coins } = session.metadata ?? {}

      if (!userId || !coins) break

      const coinsAmount = parseInt(coins)

      // Get current balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single()

      if (!profile) break

      const newBalance = profile.coins + coinsAmount

      // Update coins
      await supabase
        .from('profiles')
        .update({ coins: newBalance })
        .eq('id', userId)

      // Record transaction
      await supabase.from('coin_transactions').insert({
        user_id: userId,
        type: 'purchase',
        amount: coinsAmount,
        balance_after: newBalance,
        description: `Purchased ${coinsAmount} coins`,
        stripe_payment_id: session.payment_intent as string,
      })

      break
    }

    default:
      console.log(`Unhandled event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
