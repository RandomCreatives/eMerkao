'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, MessageCircle, ShieldCheck, CreditCard, CheckCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../components/AuthContext'
import { REGIONS } from '../../../constants'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { n: 1 as Step, label: 'Business', icon: Store },
  { n: 2 as Step, label: 'Telegram', icon: MessageCircle },
  { n: 3 as Step, label: 'KYC', icon: ShieldCheck },
  { n: 4 as Step, label: 'Payout', icon: CreditCard },
]

export default function VendorRegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    business_name: '', slug: '', region: '', description: '',
    telegram_channel: '', telegram_chat_id: '',
    id_type: 'national_id', id_file: '',
    payout_method: 'telebirr', payout_account: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const next = () => setStep(s => Math.min(4, s + 1) as Step)
  const back = () => setStep(s => Math.max(1, s - 1) as Step)

  const handleSubmit = async () => {
    if (!user) { router.push('/auth?redirect=/vendor/register'); return }
    setLoading(true)
    setError('')
    try {
      const { error: vErr } = await supabase.from('vendors').insert({
        profile_id: user.id,
        business_name: form.business_name,
        slug: form.slug,
        ethiopia_region: form.region,
        store_description: form.description,
        telegram_chat_id: form.telegram_chat_id ? parseInt(form.telegram_chat_id) : null,
        is_verified: false,
        trust_score: 0,
      })
      if (vErr) throw vErr
      await supabase.from('profiles').update({ user_type: 'seller' }).eq('id', user.id)
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-stone-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 bg-white'
  const btnCls = 'w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors disabled:opacity-50'

  if (done) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-black text-stone-900">Store Created!</h2>
        <p className="text-stone-400 text-sm">Your vendor profile is under review. You'll be notified once verified.</p>
        <button onClick={() => router.push('/seller')} className={btnCls}>Go to Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Open Your Store</h1>
        <p className="text-stone-400 text-sm mt-1">4 steps to start selling on eMerkato</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map(({ n, label, icon: Icon }, i) => (
          <React.Fragment key={n}>
            <div className={`flex items-center gap-1.5 ${step === n ? 'text-orange-600' : step > n ? 'text-emerald-600' : 'text-stone-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-colors ${
                step === n ? 'border-orange-600 bg-orange-50' : step > n ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200'
              }`}>
                {step > n ? '✓' : n}
              </div>
              <span className="hidden sm:block text-xs font-black uppercase tracking-widest">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-stone-200" />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-2xl">{error}</div>}

      <div className="bg-white rounded-3xl border border-stone-200 p-8 space-y-5">
        {step === 1 && (
          <>
            <h2 className="font-black text-stone-900 uppercase tracking-tight">Business Information</h2>
            <input placeholder="Business name" value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value, slug: autoSlug(e.target.value) }))} className={inputCls} />
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-stone-400 text-sm font-bold">emerkato.et/at/</span>
              <input placeholder="your-store" value={form.slug} onChange={set('slug')} className={`${inputCls} pl-36`} />
            </div>
            <select value={form.region} onChange={set('region')} className={inputCls}>
              <option value="">Select region</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <textarea placeholder="Describe your store (optional)" value={form.description} onChange={set('description')} rows={3} className={`${inputCls} resize-none`} />
            <button onClick={next} disabled={!form.business_name || !form.slug} className={btnCls}>Continue →</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-black text-stone-900 uppercase tracking-tight">Telegram Channel</h2>
            <p className="text-stone-400 text-sm">Link your channel so the AI can auto-sync product posts.</p>
            <input placeholder="@your_channel (optional)" value={form.telegram_channel} onChange={set('telegram_channel')} className={inputCls} />
            <input placeholder="Telegram Chat ID (optional)" value={form.telegram_chat_id} onChange={set('telegram_chat_id')} className={inputCls} />
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-700 font-medium">
              Add @userinfobot to your channel to get the Chat ID.
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 border border-stone-200 text-stone-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-colors">← Back</button>
              <button onClick={next} className="flex-1 bg-stone-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">Continue →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-black text-stone-900 uppercase tracking-tight">Identity Verification</h2>
            <p className="text-stone-400 text-sm">Upload your Business License or National ID for the Verified badge.</p>
            <select value={form.id_type} onChange={set('id_type')} className={inputCls}>
              <option value="national_id">National ID</option>
              <option value="business_license">Business License</option>
              <option value="trade_license">Trade License</option>
            </select>
            <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center">
              <ShieldCheck className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-500">Upload document</p>
              <p className="text-xs text-stone-400 mt-1">JPG, PNG or PDF — max 5MB</p>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" id="kyc-upload"
                onChange={e => setForm(p => ({ ...p, id_file: e.target.files?.[0]?.name || '' }))} />
              <label htmlFor="kyc-upload" className="mt-4 inline-block cursor-pointer bg-stone-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
                {form.id_file || 'Choose File'}
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 border border-stone-200 text-stone-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-colors">← Back</button>
              <button onClick={next} className="flex-1 bg-stone-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">Continue →</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-black text-stone-900 uppercase tracking-tight">Payout Setup</h2>
            <p className="text-stone-400 text-sm">Where should we send your earnings?</p>
            <div className="grid grid-cols-3 gap-3">
              {(['telebirr', 'mpesa', 'bank'] as const).map(m => (
                <button key={m} onClick={() => setForm(p => ({ ...p, payout_method: m }))}
                  className={`py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                    form.payout_method === m ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-stone-200 text-stone-500'
                  }`}>
                  {m === 'mpesa' ? 'M-Pesa' : m === 'bank' ? 'Bank' : 'Telebirr'}
                </button>
              ))}
            </div>
            <input
              placeholder={form.payout_method === 'bank' ? 'Account number' : 'Phone number'}
              value={form.payout_account}
              onChange={set('payout_account')}
              className={inputCls}
            />
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 border border-stone-200 text-stone-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-colors">← Back</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-colors disabled:opacity-50">
                {loading ? 'Creating...' : 'Launch Store 🚀'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
