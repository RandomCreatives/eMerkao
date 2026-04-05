'use client'

import React, { useState } from 'react'
import {
  Package, TrendingUp, ShieldCheck, Plus, BarChart2,
  RefreshCw, Clock, CheckCircle, Wallet, Sparkles,
  ToggleLeft, ToggleRight, Send
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { MOCK_PRODUCTS } from '../../constants'

type Tab = 'overview' | 'orders' | 'products' | 'analytics' | 'payouts'

const REVENUE_DATA = [
  { day: 'Mon', revenue: 4200 }, { day: 'Tue', revenue: 6800 },
  { day: 'Wed', revenue: 3100 }, { day: 'Thu', revenue: 9400 },
  { day: 'Fri', revenue: 7200 }, { day: 'Sat', revenue: 12500 },
  { day: 'Sun', revenue: 8900 },
]

const MOCK_ORDERS = [
  { id: 'ORD-001', product: 'Habesha Kemis', buyer: 'Tigist A.', total: 4500, escrow: 'awaiting_pickup', date: '2026-04-03' },
  { id: 'ORD-002', product: 'Berbere Spice', buyer: 'Dawit M.', total: 700, escrow: 'in_transit', date: '2026-04-04' },
  { id: 'ORD-003', product: 'Jebena Set', buyer: 'Sara K.', total: 1700, escrow: 'awaiting_confirmation', date: '2026-04-04' },
  { id: 'ORD-004', product: 'Tecno Spark', buyer: 'Yonas B.', total: 18500, escrow: 'funds_available', date: '2026-04-01' },
]

const ESCROW_CONFIG: Record<string, { label: string; color: string }> = {
  awaiting_pickup: { label: 'Awaiting Pickup', color: 'bg-orange-50 text-orange-700' },
  in_transit: { label: 'In Transit', color: 'bg-indigo-50 text-indigo-700' },
  awaiting_confirmation: { label: 'Awaiting Buyer Confirmation', color: 'bg-amber-50 text-amber-700' },
  funds_available: { label: 'Funds Available', color: 'bg-emerald-50 text-emerald-700' },
}

export default function SellerDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [productActive, setProductActive] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_PRODUCTS.map(p => [p.id, true]))
  )
  const [syncing, setSyncing] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)

  const handleTelegramSync = async () => {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 2000))
    setSyncing(false)
    alert('Synced 2 new products from your Telegram channel!')
  }

  const handleAiRestock = async () => {
    setLoadingAi(true)
    await new Promise(r => setTimeout(r, 1500))
    setAiSuggestion('☕ Coffee sets are trending ahead of the upcoming Timkat holiday. Consider restocking Jebena Sets — demand is projected to rise 40% in the next 2 weeks.')
    setLoadingAi(false)
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    { id: 'products', label: 'Products' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'payouts', label: 'Payouts' },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales', value: '124,500 ETB', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Active Orders', value: '4', icon: Package, color: 'bg-orange-50 text-orange-700' },
          { label: 'Trust Score', value: '4.7 / 5', icon: ShieldCheck, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Available Balance', value: '18,500 ETB', icon: Wallet, color: 'bg-stone-100 text-stone-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-3xl border border-stone-200 p-5">
            <div className={`inline-flex p-2.5 rounded-2xl ${color} mb-3`}><Icon className="w-5 h-5" /></div>
            <p className="text-xl font-black text-stone-900">{value}</p>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTelegramSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from Telegram'}
        </button>
        <button
          onClick={() => setTab('products')}
          className="flex items-center gap-2 bg-stone-900 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
        <button
          onClick={handleAiRestock}
          disabled={loadingAi}
          className="flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-100 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {loadingAi ? 'Thinking...' : 'AI Restock Tip'}
        </button>
      </div>

      {aiSuggestion && (
        <div className="bg-gradient-to-r from-indigo-50 to-orange-50 border border-indigo-100 rounded-2xl p-5 flex gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 flex-none mt-0.5" />
          <p className="text-sm text-indigo-900 font-medium">{aiSuggestion}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-none px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors ${
              tab === t.id ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6">
          <h3 className="font-black text-stone-900 text-sm uppercase tracking-tight mb-4">Daily Revenue (ETB)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ETB`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#ea580c" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Orders — Escrow Tracker */}
      {tab === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h3 className="font-black text-stone-900 text-sm uppercase tracking-tight">Escrow Tracker</h3>
          </div>
          <div className="divide-y divide-stone-100">
            {MOCK_ORDERS.map(order => {
              const cfg = ESCROW_CONFIG[order.escrow]
              return (
                <div key={order.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-black text-stone-900 text-sm">{order.product}</p>
                    <p className="text-stone-400 text-xs mt-0.5">{order.id} · {order.buyer} · {order.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-stone-900 text-sm">{order.total.toLocaleString()} ETB</span>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {order.escrow === 'funds_available' && (
                      <button className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                        <Wallet className="w-3 h-3" /> Withdraw
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Products — Toggle Active/Inactive */}
      {tab === 'products' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-black text-stone-900 text-sm uppercase tracking-tight">Product Management</h3>
            <button className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {MOCK_PRODUCTS.map(p => (
              <div key={p.id} className="p-4 flex items-center gap-4">
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-2xl object-cover flex-none" />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-stone-900 text-sm truncate">{p.name}</p>
                  <p className="text-stone-400 text-xs">{p.price.toLocaleString()} ETB · {p.category}</p>
                </div>
                <button
                  onClick={() => setProductActive(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                    productActive[p.id] ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {productActive[p.id]
                    ? <><ToggleRight className="w-4 h-4" /> Active</>
                    : <><ToggleLeft className="w-4 h-4" /> Inactive</>
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6">
            <h3 className="font-black text-stone-900 text-sm uppercase tracking-tight mb-4">Daily Revenue</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ETB`]} />
                <Area type="monotone" dataKey="revenue" stroke="#ea580c" fill="#fff7ed" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-3xl border border-stone-200 p-6">
            <h3 className="font-black text-stone-900 text-sm uppercase tracking-tight mb-4">Most Viewed Products</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MOCK_PRODUCTS.map(p => ({ name: p.name.split(' ').slice(0, 2).join(' '), views: Math.floor(Math.random() * 200) + 50 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#1c1917" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Payouts */}
      {tab === 'payouts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
            <h3 className="font-black text-stone-900 text-sm uppercase tracking-tight">Available Balance</h3>
            <p className="text-4xl font-black text-emerald-600">18,500 ETB</p>
            <div className="grid grid-cols-3 gap-3">
              {(['telebirr', 'mpesa', 'bank'] as const).map(m => (
                <button key={m} className="py-3 rounded-2xl border border-stone-200 font-black text-xs uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition-colors">
                  {m === 'mpesa' ? 'M-Pesa' : m === 'bank' ? 'Bank' : 'Telebirr'}
                </button>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors">
              <Send className="w-4 h-4" /> Withdraw Funds
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-stone-200 p-6">
            <h3 className="font-black text-stone-900 text-sm uppercase tracking-tight mb-4">Payout History</h3>
            {[
              { date: '2026-04-01', amount: 12000, method: 'Telebirr', status: 'completed' },
              { date: '2026-03-25', amount: 8500, method: 'Telebirr', status: 'completed' },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                <div>
                  <p className="font-black text-stone-900 text-sm">{p.amount.toLocaleString()} ETB</p>
                  <p className="text-stone-400 text-xs">{p.date} · {p.method}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
