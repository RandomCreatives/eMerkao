import { NextApiRequest, NextApiResponse } from 'next'
import { handleTelegramWebhook } from '../../../services/telegramService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
    if (webhookSecret) {
      const providedSecret = req.headers['x-telegram-bot-api-secret-token']
      if (providedSecret !== webhookSecret) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
    }

    // Process the update
    await handleTelegramWebhook(req.body)
    
    // Respond with 200 OK
    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}