import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

// Use service role for server-side inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface TelegramPhoto {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  file_size?: number
}

interface TelegramMessage {
  message_id: number
  from?: { id: number; username?: string }
  chat: { id: number }
  text?: string
  caption?: string
  photo?: TelegramPhoto[]
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  channel_post?: TelegramMessage
}

async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return null
  const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`)
  const json = await res.json()
  if (!json.ok) return null
  return `https://api.telegram.org/file/bot${token}/${json.result.file_path}`
}

async function parseProductWithGemini(caption: string, imageUrl: string | null) {
  const parts: any[] = []

  // Add image if available
  if (imageUrl) {
    const imgRes = await fetch(imageUrl)
    const imgBuffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(imgBuffer).toString('base64')
    const mimeType = 'image/jpeg'
    parts.push({ inlineData: { data: base64, mimeType } })
  }

  parts.push({
    text: `You are an AI assistant for eMerkato, an Ethiopian marketplace.
Analyze this Telegram product post and extract structured data.

Caption: "${caption}"

Return ONLY valid JSON with this exact shape:
{
  "name": "product name",
  "price": 0,
  "currency": "ETB",
  "description": "short description",
  "category": "one of: Habesha Clothes, Ceremonial Wear, Spices (Berbere), Coffee Sets (Jebena), Religious Goods, Electronics, General"
}

Rules:
- price must be a number (extract from ETB/Birr mentions)
- category must match one of the listed options exactly
- description should be 1-2 sentences max`
  })

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [{ role: 'user', parts }],
  })

  const text = response.text?.trim() || ''
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(cleaned)
}

async function findVendorByTelegramId(telegramUserId: number) {
  // Look up profile by telegram_user_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_user_id', telegramUserId)
    .single()

  if (!profile) return null

  // Get vendor linked to this profile
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, business_name')
    .eq('profile_id', profile.id)
    .single()

  return vendor
}

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify webhook secret
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const update: TelegramUpdate = req.body
  const message = update.message || update.channel_post

  if (!message) return res.status(200).json({ ok: true })

  const caption = message.caption || message.text || ''
  const senderId = message.from?.id
  const chatId = message.chat.id

  // Only process messages that look like product posts
  const isProductPost = /\d+\s*(etb|birr|ብር)/i.test(caption)
  if (!isProductPost || !caption) return res.status(200).json({ ok: true })

  try {
    // Get image URL if photo attached
    let imageUrl: string | null = null
    if (message.photo?.length) {
      const largest = message.photo[message.photo.length - 1]
      imageUrl = await getTelegramFileUrl(largest.file_id)
    }

    // Parse product with Gemini
    const productData = await parseProductWithGemini(caption, imageUrl)

    // Find vendor by Telegram sender ID
    const vendor = senderId ? await findVendorByTelegramId(senderId) : null

    if (!vendor) {
      await sendTelegramMessage(chatId,
        '⚠️ Your Telegram account is not linked to an eMerkato vendor. Visit eMerkato to link your account.'
      )
      return res.status(200).json({ ok: true })
    }

    // Insert product into Supabase
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        vendor_id: vendor.id,
        seller_id: vendor.id, // keep seller_id in sync
        name: productData.name,
        description: productData.description,
        price: productData.price,
        currency: 'ETB',
        category_slug: productData.category.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, ''),
        metadata: {
          source: 'telegram',
          raw_caption: caption,
          image_url: imageUrl,
          parsed_at: new Date().toISOString(),
        },
        images: imageUrl ? [imageUrl] : [],
        status: 'active',
        synced_from_telegram: true,
        telegram_chat_id: chatId,
        telegram_message_id: message.message_id,
      })
      .select('id, name')
      .single()

    if (error) throw error

    await sendTelegramMessage(chatId,
      `✅ Product synced to ${vendor.business_name}!\n\n📦 ${product.name}\n💰 ${productData.price} ETB\n🏷️ ${productData.category}`
    )

    return res.status(200).json({ ok: true, product_id: product.id })
  } catch (err: any) {
    console.error('Webhook error:', err)
    await sendTelegramMessage(chatId,
      '❌ Could not parse your product post. Make sure to include the price in ETB and a clear product name.'
    )
    return res.status(200).json({ ok: true, error: err.message })
  }
}
