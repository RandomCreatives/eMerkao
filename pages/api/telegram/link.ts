import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { telegram_user_id, telegram_username, telegram_chat_id } = req.body

    // For now, we'll create a simple response
    // In production, you'd want proper auth handling
    res.status(200).json({ 
      success: true, 
      message: 'Telegram linking endpoint ready. Please set up Supabase first.',
      received_data: { telegram_user_id, telegram_username, telegram_chat_id }
    })

  } catch (error) {
    console.error('Link error:', error)
    res.status(500).json({ error: 'Failed to link account' })
  }
}