import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { CheckCircle2, AlertCircle, Loader2, MessageSquare, Link as LinkIcon } from 'lucide-react'

const TelegramLinkPage: React.FC = () => {
  const router = useRouter()
  const { chat_id, user_id, username } = router.query
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(window.location.href)
        router.push(`/auth?redirect=${returnUrl}`)
        return
      }
      setUser(user)
    }

    checkAuth()
  }, [router])

  const handleLinkAccount = async () => {
    if (!chat_id || !user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/telegram/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_user_id: parseInt(user_id as string) || null,
          telegram_username: username || null,
          telegram_chat_id: parseInt(chat_id as string)
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to link account')
      }

      setSuccess(true)
      
      // Redirect to seller dashboard after 3 seconds
      setTimeout(() => {
        router.push('/seller')
      }, 3000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl max-w-md w-full text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-stone-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-stone-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-600/20">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase mb-2">
            Link Telegram Account
          </h1>
          <p className="text-stone-500 text-sm">
            Connect your Telegram to automatically sync products to eMerkato
          </p>
        </div>

        {/* Success State */}
        {success && (
          <div className="text-center space-y-6">
            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-900 mb-2">Successfully Linked!</h2>
              <p className="text-emerald-700 text-sm leading-relaxed">
                Your Telegram account is now connected to eMerkato. 
                The bot will automatically sync your product posts to your store.
              </p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-emerald-800 text-xs font-bold">
                🤖 Go back to Telegram and try posting a product!
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center space-y-6">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-4 border-red-100">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-red-900 mb-2">Link Failed</h2>
              <p className="text-red-700 text-sm leading-relaxed mb-4">
                {error}
              </p>
              <button 
                onClick={handleLinkAccount}
                className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Default State */}
        {!success && !error && (
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
              <h3 className="font-black text-stone-900 text-sm uppercase tracking-widest mb-4">
                Account Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-xs font-bold">eMerkato Account</span>
                  <span className="text-stone-900 text-xs font-black">{user.email}</span>
                </div>
                {username && (
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 text-xs font-bold">Telegram Username</span>
                    <span className="text-stone-900 text-xs font-black">@{username}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-xs font-bold">Chat ID</span>
                  <span className="text-stone-900 text-xs font-black">{chat_id}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-black text-stone-900 text-sm uppercase tracking-widest">
                What you'll get:
              </h3>
              <div className="space-y-2">
                {[
                  'Auto-sync product posts from Telegram groups',
                  'AI-powered product detail extraction',
                  'Real-time inventory management',
                  'Cross-platform posting to Facebook & Instagram'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-stone-700 text-xs font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Link Button */}
            <button 
              onClick={handleLinkAccount}
              disabled={loading || !chat_id}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Linking Account...
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5" />
                  Link Telegram Account
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-blue-800 text-xs font-medium leading-relaxed">
                🔒 <strong>Secure Connection:</strong> We only store your Telegram chat ID to enable bot communication. 
                Your messages are processed securely and stored in your eMerkato account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TelegramLinkPage