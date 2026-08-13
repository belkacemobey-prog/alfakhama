import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createClient()
    const orderNumber = generateOrderNumber()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_phone2: body.customer_phone2 || null,
        governorate_id: body.governorate_id,
        governorate_name: body.governorate_name,
        address: body.address || null,
        notes: body.notes || null,
        total_amount: body.total_amount,
        delivery_fee: body.delivery_fee,
        status: 'pending',
        payment_method: 'cash_on_delivery',
      })
      .select()
      .single()

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 })

    const { error: itemsError } = await supabase.from('order_items').insert(
      body.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      }))
    )

    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 400 })

    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json(data)
  }

  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50)
  return NextResponse.json(data)
}
