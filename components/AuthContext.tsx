'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type UserRole = 'guest' | 'buyer' | 'vendor' | 'admin'

export interface AuthUser {
  id: string
  email?: string
  phone?: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  telegram_id?: number
  telegram_username?: string
  is_verified?: boolean
  trust_score?: number
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isGuest: boolean
  guestId: string
  signInWithPhone: (phone: string) => Promise<{ error?: string }>
  verifyOtp: (phone: string, token: string) => Promise<{ error?: string }>
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  continueAsGuest: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return 'guest-ssr'
  let id = localStorage.getItem('emerkato_guest_id')
  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('emerkato_guest_id', id)
  }
  return id
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [guestId] = useState(getOrCreateGuestId)

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, user_type, telegram_user_id, telegram_username, is_verified, trust_score')
      .eq('id', userId)
      .single()

    return data
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id)
        setUser({
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          role: (profile?.user_type as UserRole) ?? 'buyer',
          telegram_id: profile?.telegram_user_id,
          telegram_username: profile?.telegram_username,
          is_verified: profile?.is_verified,
          trust_score: profile?.trust_score,
        })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id)
        setUser({
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          role: (profile?.user_type as UserRole) ?? 'buyer',
          telegram_id: profile?.telegram_user_id,
          telegram_username: profile?.telegram_username,
          is_verified: profile?.is_verified,
          trust_score: profile?.trust_score,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signInWithPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone })
    return { error: error?.message }
  }

  const verifyOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    return { error: error?.message }
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: name,
        user_type: 'buyer',
      })
    }
    return { error: error?.message }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const continueAsGuest = () => setUser(null)

  return (
    <AuthContext.Provider value={{
      user, loading, isGuest: !user, guestId,
      signInWithPhone, verifyOtp, signInWithEmail, signUp, signOut, continueAsGuest,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
