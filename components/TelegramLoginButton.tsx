'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface Props {
  onSuccess?: (userType: string) => void
  redirectVendorTo?: string
  redirectBuyerTo?: string
}

export default function TelegramLoginButton({
  onSuccess,
  redirectVendorTo = '/seller',
  redirectBuyerTo = '/buyer-dashboard',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleTelegramAuth = async (tgUser: TelegramUser) => {
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser),
      })

      if (!res.ok) throw new Error('Telegram auth failed')

      const { token, userType } = await res.json()

      if (token) {
        // Sign in using the magic link token
        await supabase.auth.verifyOtp({ token_hash: token, type: 'magiclink' })
      }

      onSuccess?.(userType)

      if (userType === 'seller' || userType === 'vendor') {
        router.push(redirectVendorTo)
      } else {
        router.push(redirectBuyerTo)
      }
    } catch (err) {
      console.error('Telegram login error:', err)
    }
  }

  useEffect(() => {
    if (!containerRef.current) return
    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME
    if (!botName) return

    // Expose callback globally for the Telegram widget
    ;(window as any).onTelegramAuth = handleTelegramAuth

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(script)

    return () => {
      delete (window as any).onTelegramAuth
    }
  }, [])

  return <div ref={containerRef} className="flex justify-center" />
}
