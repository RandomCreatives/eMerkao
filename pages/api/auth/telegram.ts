import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

function verifyTelegramHash(data: TelegramAuthData): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false

  const { hash, ...rest } = data
  const checkString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${(rest as any)[k]}`)
    .join('\n')

  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')

  // Also verify auth_date is not older than 24h
  const age = Math.floor(Date.now() / 1000) - data.auth_date
  if (age > 86400) return false

  return hmac === hash
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const authData: TelegramAuthData = req.body

  if (!verifyTelegramHash(authData)) {
    return res.status(401).json({ error: 'Invalid Telegram auth data' })
  }

  const telegramId = authData.id
  const fullName = [authData.first_name, authData.last_name].filter(Boolean).join(' ')

  // Check if profile exists with this telegram_user_id
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id, user_type, email')
    .eq('telegram_user_id', telegramId)
    .single()

  let userId: string
  let userType: string

  if (existing) {
    userId = existing.id
    userType = existing.user_type
  } else {
    // Create a new profile via admin (no email/password needed for Telegram users)
    const fakeEmail = `tg_${telegramId}@telegram.emerkato.et`
    const fakePassword = crypto.randomBytes(32).toString('hex')

    const { data: newAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: fakePassword,
      email_confirm: true,
    })

    if (authError || !newAuth.user) {
      return res.status(500).json({ error: 'Failed to create user' })
    }

    userId = newAuth.user.id
    userType = 'buyer'

    await supabaseAdmin.from('profiles').insert({
      id: userId,
      email: fakeEmail,
      full_name: fullName,
      avatar_url: authData.photo_url || null,
      telegram_user_id: telegramId,
      telegram_username: authData.username || null,
      user_type: 'buyer',
      is_verified: false,
    })
  }

  // Generate a magic link / custom token for the client to sign in
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: existing?.email || `tg_${telegramId}@telegram.emerkato.et`,
  })

  if (linkError || !linkData) {
    return res.status(500).json({ error: 'Failed to generate session' })
  }

  // Extract the token from the magic link
  const url = new URL(linkData.properties.action_link)
  const token = url.searchParams.get('token')

  return res.status(200).json({
    token,
    userId,
    userType,
    fullName,
    avatarUrl: authData.photo_url || null,
    username: authData.username || null,
  })
}
