import { NextRequest, NextResponse } from 'next/server'
import { stripe, COIN_PACKAGES } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Check auth
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { packageId } = await req.json()
  const pkg = COIN_PACKAGES.find(p => p.id === packageId)
  if (!pkg) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: pkg.price,
          product_data: {
            name: `QA12 — ${pkg.coins} Coins`,
            description: `${pkg.coins / 100} app testing campaigns`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      coins: pkg.coins.toString(),
      packageId: pkg.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/coins?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/coins?cancelled=1`,
    customer_email: user.email,
  })

  return NextResponse.json({ url: session.url })
}
