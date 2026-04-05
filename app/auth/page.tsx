'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Phone, Mail, ArrowRight, MessageCircle } from 'lucide-react'
import { useAuth } from '../../components/AuthContext'
import TelegramLoginButton from '../../components/TelegramLoginButton'

type Mode = 'choose' | 'phone' | 'otp' | 'email' | 'signup'

function AuthContent() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const { signInWithPhone, verifyOtp, signInWithEmail, signUp, continueAsGuest } = useAuth()

  const [mode, setMode] = useState<Mode>('choose')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async (fn: () => Promise<{ error?: string }>) => {
    setLoading(true)
    setError('')
    const { error } = await fn()
    setLoading(false)
    if (error) { setError(error); return false }
    return true
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await handle(() => signInWithPhone(phone))
    if (ok) setMode('otp')
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await handle(() => verifyOtp(phone, otp))
    if (ok) router.push(redirect)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await handle(() => signInWithEmail(email, password))
    if (ok) router.push(redirect)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await handle(() => signUp(email, password, name))
    if (ok) router.push(redirect)
  }

  const handleGuest = () => {
    continueAsGuest()
    router.push(redirect)
  }

  const inputCls = 'w-full border border-stone-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 bg-white'
  const btnCls = 'w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors disabled:opacity-50'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 w-full max-w-md space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            {mode === 'choose' && 'Sign in to eMerkato'}
            {mode === 'phone' && 'Enter your phone'}
            {mode === 'otp' && 'Enter OTP'}
            {mode === 'email' && 'Sign in with email'}
            {mode === 'signup' && 'Create account'}
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            {mode === 'choose' && 'Choose how you want to continue'}
            {mode === 'phone' && 'We\'ll send a one-time code via SMS'}
            {mode === 'otp' && `Code sent to ${phone}`}
            {mode === 'email' && 'Use your email and password'}
            {mode === 'signup' && 'Join the eMerkato marketplace'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        {/* Choose mode */}
        {mode === 'choose' && (
          <div className="space-y-3">
            {/* Telegram */}
            <div className="border border-stone-200 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3 text-center">
                One-tap login
              </p>
              <TelegramLoginButton
                redirectVendorTo="/seller"
                redirectBuyerTo="/buyer-dashboard"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 font-bold">or</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <button
              onClick={() => setMode('phone')}
              className="w-full flex items-center gap-3 border border-stone-200 rounded-2xl px-5 py-4 hover:bg-stone-50 transition-colors font-bold text-sm text-stone-700"
            >
              <Phone className="w-5 h-5 text-orange-600" />
              Continue with Phone (OTP)
              <ArrowRight className="w-4 h-4 ml-auto text-stone-400" />
            </button>

            <button
              onClick={() => setMode('email')}
              className="w-full flex items-center gap-3 border border-stone-200 rounded-2xl px-5 py-4 hover:bg-stone-50 transition-colors font-bold text-sm text-stone-700"
            >
              <Mail className="w-5 h-5 text-stone-600" />
              Continue with Email
              <ArrowRight className="w-4 h-4 ml-auto text-stone-400" />
            </button>

            <button
              onClick={handleGuest}
              className="w-full text-center text-sm text-stone-400 hover:text-stone-600 font-bold py-2 transition-colors"
            >
              Continue as Guest →
            </button>

            <p className="text-center text-xs text-stone-400">
              New vendor?{' '}
              <a href="/vendor/register" className="text-orange-600 font-black hover:underline">
                Register your store
              </a>
            </p>
          </div>
        )}

        {/* Phone */}
        {mode === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <input
              type="tel"
              placeholder="+251 9XX XXX XXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className={inputCls}
            />
            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <button type="button" onClick={() => setMode('choose')} className="w-full text-center text-sm text-stone-400 font-bold">
              ← Back
            </button>
          </form>
        )}

        {/* OTP */}
        {mode === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              required
              className={`${inputCls} text-center text-2xl tracking-[0.5em] font-black`}
            />
            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button type="button" onClick={() => setMode('phone')} className="w-full text-center text-sm text-stone-400 font-bold">
              ← Resend code
            </button>
          </form>
        )}

        {/* Email login */}
        {mode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className={inputCls} />
            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setMode('choose')} className="text-stone-400 font-bold">← Back</button>
              <button type="button" onClick={() => setMode('signup')} className="text-orange-600 font-black">Create account</button>
            </div>
          </form>
        )}

        {/* Signup */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} />
            <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required className={inputCls} />
            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button type="button" onClick={() => setMode('email')} className="w-full text-center text-sm text-stone-400 font-bold">← Back</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  )
}
