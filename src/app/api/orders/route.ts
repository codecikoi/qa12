import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { COINS_PER_TEST } from '@/lib/stripe'
import { z } from 'zod'

const orderSchema = z.object({
  app_name: z.string().min(1).max(100),
  play_store_url: z.string().url(),
  package_name: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate body
  const body = await req.json()
  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Check user has enough coins
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', user.id)
    .single()

  if (!profile || profile.coins < COINS_PER_TEST) {
    return NextResponse.json(
      { error: `Insufficient coins. You need ${COINS_PER_TEST} coins to start a test.` },
      { status: 402 }
    )
  }

  const newBalance = profile.coins - COINS_PER_TEST

  // Deduct coins & create order atomically via RPC (or sequential writes)
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      user_id: user.id,
      app_name: parsed.data.app_name,
      play_store_url: parsed.data.play_store_url,
      package_name: parsed.data.package_name,
      coins_spent: COINS_PER_TEST,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Deduct coins
  await adminSupabase
    .from('profiles')
    .update({ coins: newBalance })
    .eq('id', user.id)

  // Log transaction
  await adminSupabase.from('coin_transactions').insert({
    user_id: user.id,
    type: 'spend',
    amount: -COINS_PER_TEST,
    balance_after: newBalance,
    description: `Testing started: ${parsed.data.app_name}`,
    order_id: order.id,
  })

  return NextResponse.json({ order }, { status: 201 })
}
