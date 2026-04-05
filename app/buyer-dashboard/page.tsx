'use client'

import React, { useState, useTransition } from 'react'
import { Package, Clock, CheckCircle, ShieldCheck, Truck } from 'lucide-react'
import { useAuth } from '../../components/AuthContext'
import Link from 'next/link'
import { confirmDelivery } from '../../lib/actions/payment'

type EscrowStatus = 'pending' | 'payment_captured' | 'delivered_confirmed' | 'funds_released'

interface Order {
  id: string
  product: string
  vendor: string
  total: number
  escrow: EscrowStatus
  date: string
}

const INITIAL_ORDERS: Order[] = [
  { id: 'ORD-001', product: 'Handwoven Habesha Kemis', vendor: 'Habesha Crafts', total: 4500, escrow: 'payment_captured', date: '2026-04-01' },
  { id: 'ORD-002', product: 'Pure Berbere Spice (500g)', vendor: 'Spice Market', total: 700, escrow: 'payment_captured', date: '2026-04-03' },
  { id: 'ORD-003', product: 'Black Coffee Clay Pot', vendor: 'Sidama Crafts', total: 850, escrow: 'delivered_confirmed', date: '2026-03-28' },
  { id: 'ORD-004', product: 'Tecno Spark 10 Pro', vendor: 'Bole Electronics', total: 18500, escrow: 'funds_released', date: '2026-03-20' },
]

const ESCROW_LABELS: Record<EscrowStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-stone-500 bg-stone-100', icon: Clock },
  payment_captured: { label: 'In Transit', color: 'text-indigo-600 bg-indigo-50', icon: Truck },
  delivered_confirmed: { label: 'Delivered', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  funds_released: { label: 'Completed', color: 'text-stone-400 bg-stone-50', icon: CheckCircle },
}

export default function BuyerDashboardPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [isPending, startTransition] = useTransition()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const handleConfirmReceipt = (orderId: string) => {
    setConfirmingId(orderId)
    startTransition(async () => {
      // Call server action if user is authenticated
      if (user) {
        await confirmDelivery(orderId, user.id)
      }
      // Optimistic update
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, escrow: 'delivered_confirmed' } : o
      ))
      setConfirmingId(null)
    })
  }

  const activeOrders = orders.filter(o => o.escrow === 'payment_captured')
  const completedOrders = orders.filter(o => o.escrow === 'delivered_confirmed' || o.escrow === 'funds_released')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">My Account</h1>
          {user && (
            <p className="text-stone-400 text-sm mt-1">
              Welcome back, {user.full_name || user.telegram_username || 'there'}
              {user.telegram_id && (
                <span className="ml-2 inline-flex items-center gap-1 text-indigo-600 text-xs font-bold">
                  <span>✈</span> Telegram linked
                </span>
              )}
            </p>
          )}
        </div>
        {!user && (
          <Link href="/auth" className="bg-stone-900 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
            Sign In
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: orders.length },
          { label: 'Active', value: activeOrders.length },
          { label: 'Completed', value: completedOrders.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-3xl border border-stone-200 p-5 text-center">
            <p className="text-3xl font-black text-stone-900">{value}</p>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Active Orders — Escrow Dashboard */}
      {activeOrders.length > 0 && (
        <div className="bg-white rounded-3xl border border-orange-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-orange-100 bg-orange-50 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <h2 className="font-black text-orange-900 text-sm uppercase tracking-tight">Active Orders — Escrow Protected</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {activeOrders.map(order => (
              <div key={order.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-black text-stone-900 text-sm">{order.product}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{order.id} · {order.vendor} · {order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-stone-900 text-sm">{order.total.toLocaleString()} ETB</span>
                  <button
                    onClick={() => handleConfirmReceipt(order.id)}
                    disabled={isPending && confirmingId === order.id}
                    className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors disabled:opacity-60 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isPending && confirmingId === order.id ? 'Confirming...' : 'Confirm Receipt'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-orange-50 text-xs text-orange-700 font-medium">
            Funds are held in escrow until you confirm delivery. Only confirm when you've received your order.
          </div>
        </div>
      )}

      {/* Full Order History */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h2 className="font-black text-stone-900 uppercase tracking-tight text-sm flex items-center gap-2">
            <Package className="w-4 h-4" /> Order History
          </h2>
        </div>
        <div className="divide-y divide-stone-100">
          {orders.map(order => {
            const { label, color, icon: Icon } = ESCROW_LABELS[order.escrow]
            return (
              <div key={order.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-black text-stone-900 text-sm">{order.product}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{order.id} · {order.vendor} · {order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-stone-900 text-sm">{order.total.toLocaleString()} ETB</span>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${color}`}>
                    <Icon className="w-3 h-3" /> {label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
