'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface VendorOrder {
  vendorId: string
  vendorName: string
  items: { productId: string; name: string; qty: number; price: number }[]
  subtotal: number
  delivery: { label: string; price: number; eta: string }
  notes: string
}

interface ProcessPaymentInput {
  paymentMethod: 'telebirr' | 'chapa'
  orderTotal: number
  buyerPhone: string
  deliveryAddress: string
  vendorOrders: VendorOrder[]
}

interface ProcessPaymentResult {
  checkoutUrl?: string
  txRef?: string
  error?: string
}

function generateTxRef(): string {
  return `EMK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

async function initChapa(txRef: string, amount: number, phone: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: 'ETB',
      tx_ref: txRef,
      callback_url: `${appUrl}/api/payments/webhook`,
      return_url: `${appUrl}/checkout/success?tx_ref=${txRef}`,
      customization: {
        title: 'eMerkato Order',
        description: 'Multi-vendor marketplace payment',
      },
    }),
  })
  const data = await res.json()
  if (data.status !== 'success') throw new Error(data.message || 'Chapa init failed')
  return data.data.checkout_url
}

async function initTelebirr(txRef: string, amount: number, phone: string): Promise<string> {
  // Telebirr USSD Push / H5 Pay — placeholder returning a mock URL
  // Replace with actual Telebirr SDK call when credentials are available
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  console.log('[Telebirr] Would initiate payment:', { txRef, amount, phone })
  // Return success page directly in demo mode
  return `${appUrl}/checkout/success?tx_ref=${txRef}&method=telebirr&demo=1`
}

export async function processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult> {
  const { paymentMethod, orderTotal, buyerPhone, deliveryAddress, vendorOrders } = input
  const txRef = generateTxRef()

  try {
    // 1. Create one order record per vendor, all linked by payment_session_id
    for (const vo of vendorOrders) {
      const orderNumber = `${txRef}-${vo.vendorId.slice(0, 6).toUpperCase()}`
      const { error } = await supabaseAdmin.from('orders').insert({
        order_number: orderNumber,
        payment_session_id: txRef,
        vendor_id: vo.vendorId,
        subtotal: vo.subtotal,
        shipping_cost: vo.delivery.price,
        total_amount: vo.subtotal + vo.delivery.price,
        status: 'pending',
        payment_status: 'pending',
        escrow_status: 'pending',
        shipping_address: { address: deliveryAddress, phone: buyerPhone },
        notes: vo.notes,
        payment_reference: txRef,
      })
      if (error) console.error('Order insert error:', error)
    }

    // 2. Call payment gateway
    let checkoutUrl: string
    if (paymentMethod === 'chapa' && process.env.CHAPA_SECRET_KEY) {
      checkoutUrl = await initChapa(txRef, orderTotal, buyerPhone)
    } else {
      checkoutUrl = await initTelebirr(txRef, orderTotal, buyerPhone)
    }

    return { checkoutUrl, txRef }
  } catch (err: any) {
    console.error('processPayment error:', err)
    return { error: err.message || 'Payment initialization failed. Please try again.' }
  }
}

export async function confirmDelivery(orderId: string, buyerId: string): Promise<{ error?: string }> {
  try {
    // Verify the order belongs to this buyer
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('id, escrow_status, vendor_id, total_amount, payment_session_id')
      .eq('id', orderId)
      .eq('buyer_id', buyerId)
      .single()

    if (fetchErr || !order) return { error: 'Order not found' }
    if (order.escrow_status !== 'payment_captured') return { error: 'Order is not in a confirmable state' }

    // Update escrow status
    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({ escrow_status: 'delivered_confirmed', status: 'delivered' })
      .eq('id', orderId)

    if (updateErr) throw updateErr

    // Notify vendor via Telegram (best-effort)
    await notifyVendorFundsReleased(order.vendor_id, order.total_amount, orderId)

    return {}
  } catch (err: any) {
    return { error: err.message }
  }
}

async function notifyVendorFundsReleased(vendorId: string, amount: number, orderId: string) {
  try {
    const { data: vendor } = await supabaseAdmin
      .from('vendors')
      .select('telegram_chat_id, business_name')
      .eq('id', vendorId)
      .single()

    if (!vendor?.telegram_chat_id) return

    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) return

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: vendor.telegram_chat_id,
        text: `✅ *Buyer confirmed delivery!*\n\nOrder: ${orderId}\nAmount: ${amount.toLocaleString()} ETB\n\nFunds will be released to your account within 24 hours. 🎉`,
        parse_mode: 'Markdown',
      }),
    })
  } catch (e) {
    console.error('Vendor notification failed:', e)
  }
}
