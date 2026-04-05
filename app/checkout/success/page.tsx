'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, ShieldCheck, Package } from 'lucide-react'

function SuccessContent() {
  const params = useSearchParams()
  const txRef = params.get('tx_ref')

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="relative inline-block">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Order Placed!</h1>
          {txRef && <p className="text-stone-400 text-xs font-bold mt-2 uppercase tracking-widest">Ref: {txRef}</p>}
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 flex-none mt-0.5" />
            <div>
              <p className="font-black text-indigo-900 text-sm">Payment in Escrow</p>
              <p className="text-indigo-700 text-xs mt-0.5">Your money is safe. Vendors are notified and preparing your order.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-indigo-600 flex-none mt-0.5" />
            <div>
              <p className="font-black text-indigo-900 text-sm">Confirm when delivered</p>
              <p className="text-indigo-700 text-xs mt-0.5">Once you receive your items, tap "Confirm Receipt" to release funds to the vendor.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/buyer-dashboard" className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
            Track Orders
          </Link>
          <Link href="/shop" className="border border-stone-200 text-stone-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}
