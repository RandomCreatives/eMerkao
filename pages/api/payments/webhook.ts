import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

function verifyChapaSignature(payload: string, signature: string): boolean {
  const secret = process.env.CHAPA_WEBHOOK_SECRET
  if (!secret) return true // skip in dev
  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return hash === signature
}

async function sendTelegramMessage(chatId: number | string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = JSON.stringify(req.body)
  const signature = (req.headers['x-chapa-signature'] as string) || ''

  if (!verifyChapaSignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const { tx_ref, status, data: paymentData } = req.body

  // Only process successful payments
  if (status !== 'success') {
    return res.status(200).json({ ok: true, skipped: true })
  }

  try {
    // 1. Fetch all orders for this payment session
    const { data: orders, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select(`
        id, order_number, total_amount, buyer_id, vendor_id,
        shipping_address,
        vendors (telegram_chat_id, business_name),
        profiles!buyer_id (telegram_chat_id, full_name, telegram_user_id)
      `)
      .eq('payment_session_id', tx_ref)

    if (fetchErr || !orders?.length) {
      console.error('Orders not found for tx_ref:', tx_ref)
      return res.status(200).json({ ok: true })
    }

    // 2. Update all orders to payment_captured (in escrow)
    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({
        escrow_status: 'payment_captured',
        payment_status: 'completed',
        status: 'confirmed',
        payment_gateway_response: paymentData || {},
      })
      .eq('payment_session_id', tx_ref)

    if (updateErr) throw updateErr

    // 3. Notify each vendor + the buyer
    const buyerProfile = (orders[0] as any).profiles
    const buyerChatId = buyerProfile?.telegram_chat_id || buyerProfile?.telegram_user_id

    for (const order of orders) {
      const vendor = (order as any).vendors
      const vendorChatId = vendor?.telegram_chat_id

      // Notify vendor
      if (vendorChatId) {
        await sendTelegramMessage(
          vendorChatId,
          `🛒 *New Order Received!*\n\n` +
          `Order: ${order.order_number}\n` +
          `Amount: ${Number(order.total_amount).toLocaleString()} ETB\n\n` +
          `💰 Payment is held in *Escrow* — prepare for delivery.\n` +
          `Funds will be released once the buyer confirms receipt.`
        )
      }
    }

    // Notify buyer with receipt
    if (buyerChatId) {
      const totalPaid = orders.reduce((s: number, o: any) => s + Number(o.total_amount), 0)
      const vendorNames = orders.map((o: any) => o.vendors?.business_name || 'Vendor').join(', ')
      const address = (orders[0] as any).shipping_address?.address || 'your address'

      await sendTelegramMessage(
        buyerChatId,
        `✅ *Payment Confirmed!*\n\n` +
        `Transaction: ${tx_ref}\n` +
        `Total Paid: ${totalPaid.toLocaleString()} ETB\n` +
        `Vendors: ${vendorNames}\n` +
        `Delivery to: ${address}\n\n` +
        `📦 Estimated delivery: 1–5 business days\n\n` +
        `When your items arrive, tap *"Confirm Receipt"* in your dashboard to release payment to the vendor.`
      )
    }

    return res.status(200).json({ ok: true, ordersUpdated: orders.length })
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return res.status(500).json({ error: err.message })
  }
}
