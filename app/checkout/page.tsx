'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Store, Truck, CreditCard, ShoppingBag, ShieldCheck, ChevronDown } from 'lucide-react'
import { useCart } from '../../components/CartContext'
import { useAuth } from '../../components/AuthContext'
import { processPayment } from '../../lib/actions/payment'

type PaymentMethod = 'telebirr' | 'chapa'
type DeliveryOption = 'standard' | 'express'

const DELIVERY_OPTIONS: Record<DeliveryOption, { label: string; price: number; eta: string }> = {
  standard: { label: 'Standard Delivery', price: 50, eta: '3–5 business days' },
  express: { label: 'Express (Addis only)', price: 150, eta: 'Same day / Next day' },
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, grandTotal, itemsByVendor, clearCart } = useCart()
  const [isPending, startTransition] = useTransition()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr')
  const [deliveryByVendor, setDeliveryByVendor] = useState<Record<string, DeliveryOption>>({})
  const [notesByVendor, setNotesByVendor] = useState<Record<string, string>>({})
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState(user?.phone || '')
  const [error, setError] = useState('')

  if (items.length === 0) return (
    <div className="text-center py-24">
      <ShoppingBag className="w-16 h-16 text-stone-200 mx-auto mb-6" />
      <h2 className="text-2xl font-black text-stone-900 mb-2">Nothing to checkout</h2>
      <Link href="/shop" className="inline-block mt-4 bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
        Browse Shop
      </Link>
    </div>
  )

  if (!user) return (
    <div className="text-center py-24 space-y-4">
      <ShieldCheck className="w-16 h-16 text-orange-400 mx-auto" />
      <h2 className="text-2xl font-black text-stone-900">Sign in to checkout</h2>
      <p className="text-stone-400 text-sm">Your cart is saved — sign in to complete your order.</p>
      <Link href="/auth?redirect=/checkout" className="inline-block bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
        Sign In / Continue
      </Link>
    </div>
  )

  const vendorGroups = Object.entries(itemsByVendor)
  const totalDelivery = vendorGroups.reduce((sum, [key]) => {
    const opt = deliveryByVendor[key] ?? 'standard'
    return sum + DELIVERY_OPTIONS[opt].price
  }, 0)
  const orderTotal = grandTotal + totalDelivery

  const handlePay = () => {
    if (!address.trim()) { setError('Please enter a delivery address.'); return }
    if (!phone.trim()) { setError('Please enter a phone number.'); return }
    setError('')

    startTransition(async () => {
      const vendorOrders = vendorGroups.map(([vendorId, group]) => ({
        vendorId,
        vendorName: group.vendorName,
        items: group.items.map(i => ({ productId: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price })),
        subtotal: group.subtotal,
        delivery: DELIVERY_OPTIONS[deliveryByVendor[vendorId] ?? 'standard'],
        notes: notesByVendor[vendorId] || '',
      }))

      const result = await processPayment({
        paymentMethod,
        orderTotal,
        buyerPhone: phone,
        deliveryAddress: address,
        vendorOrders,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.checkoutUrl) {
        // Redirect to payment gateway
        window.location.href = result.checkoutUrl
      } else {
        clearCart()
        router.push('/checkout/success')
      }
    })
  }

  const inputCls = 'w-full border border-stone-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500 bg-white'

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-2xl">{error}</div>
      )}

      {/* Delivery address */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
        <h2 className="font-black text-stone-900 text-sm uppercase tracking-tight flex items-center gap-2">
          <Truck className="w-4 h-4 text-orange-600" /> Delivery Details
        </h2>
        <input placeholder="Full delivery address (Subcity, Woreda, House No.)" value={address} onChange={e => setAddress(e.target.value)} className={inputCls} />
        <input placeholder="Phone number (+251...)" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
      </div>

      {/* Vendor groups */}
      {vendorGroups.map(([vendorId, group]) => {
        const delivery = deliveryByVendor[vendorId] ?? 'standard'
        const deliveryInfo = DELIVERY_OPTIONS[delivery]
        return (
          <div key={vendorId} className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
            {/* Vendor header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3 bg-stone-50">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-black text-sm">
                {group.vendorName.charAt(0)}
              </div>
              <div>
                <p className="font-black text-stone-900 text-sm">{group.vendorName}</p>
                <p className="text-stone-400 text-xs">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-stone-100">
              {group.items.map(({ product, qty }) => (
                <div key={product.id} className="px-6 py-4 flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="w-14 h-14 rounded-2xl object-cover flex-none" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-stone-900 text-sm truncate">{product.name}</p>
                    <p className="text-stone-400 text-xs mt-0.5">Qty: {qty}</p>
                  </div>
                  <p className="font-black text-stone-900 text-sm flex-none">{(product.price * qty).toLocaleString()} ETB</p>
                </div>
              ))}
            </div>

            {/* Delivery selection */}
            <div className="px-6 py-4 border-t border-stone-100 space-y-3">
              <div className="flex gap-3">
                {(Object.entries(DELIVERY_OPTIONS) as [DeliveryOption, typeof DELIVERY_OPTIONS[DeliveryOption]][]).map(([key, opt]) => (
                  <button
                    key={key}
                    onClick={() => setDeliveryByVendor(p => ({ ...p, [vendorId]: key }))}
                    className={`flex-1 p-3 rounded-2xl border-2 text-left transition-all ${
                      delivery === key ? 'border-orange-600 bg-orange-50' : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <p className={`font-black text-xs ${delivery === key ? 'text-orange-700' : 'text-stone-700'}`}>{opt.label}</p>
                    <p className="text-stone-400 text-[10px] mt-0.5">{opt.eta} · +{opt.price} ETB</p>
                  </button>
                ))}
              </div>

              {/* Vendor notes */}
              <textarea
                placeholder={`Special instructions for ${group.vendorName} (optional)`}
                value={notesByVendor[vendorId] || ''}
                onChange={e => setNotesByVendor(p => ({ ...p, [vendorId]: e.target.value }))}
                rows={2}
                className={`${inputCls} resize-none text-xs`}
              />

              {/* Vendor subtotal */}
              <div className="flex justify-between text-xs font-black text-stone-500 uppercase tracking-widest pt-1">
                <span>Subtotal ({group.vendorName})</span>
                <span>{(group.subtotal + deliveryInfo.price).toLocaleString()} ETB</span>
              </div>
            </div>
          </div>
        )
      })}

      {/* Payment + Order Summary */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-5">
        <h2 className="font-black text-stone-900 text-sm uppercase tracking-tight flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-orange-600" /> Payment Method
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {([
            { id: 'telebirr' as PaymentMethod, label: 'Telebirr', sub: 'Ethiopian mobile wallet' },
            { id: 'chapa' as PaymentMethod, label: 'Chapa', sub: 'Card / Bank / Other wallets' },
          ]).map(({ id, label, sub }) => (
            <button
              key={id}
              onClick={() => setPaymentMethod(id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                paymentMethod === id ? 'border-orange-600 bg-orange-50' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <p className={`font-black text-sm ${paymentMethod === id ? 'text-orange-700' : 'text-stone-700'}`}>{label}</p>
              <p className="text-stone-400 text-[10px] mt-0.5">{sub}</p>
            </button>
          ))}
        </div>

        {/* Order total breakdown */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex justify-between text-sm text-stone-500 font-bold">
            <span>Products</span>
            <span>{grandTotal.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between text-sm text-stone-500 font-bold">
            <span>Delivery</span>
            <span>{totalDelivery.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between font-black text-stone-900 text-lg pt-2 border-t border-stone-100">
            <span>Total</span>
            <span className="text-orange-600">{orderTotal.toLocaleString()} ETB</span>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 flex-none mt-0.5" />
          <p className="text-xs text-indigo-700 font-medium">
            Your payment is held in <strong>Escrow</strong> until you confirm delivery. Vendors only receive funds after you click "Confirm Receipt".
          </p>
        </div>

        <button
          onClick={handlePay}
          disabled={isPending}
          className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><span className="animate-spin">⟳</span> Processing...</>
          ) : (
            `Pay ${orderTotal.toLocaleString()} ETB with ${paymentMethod === 'telebirr' ? 'Telebirr' : 'Chapa'}`
          )}
        </button>

        <p className="text-center text-[10px] text-stone-400 font-bold uppercase tracking-widest">
          Separate orders created per vendor · Escrow protected
        </p>
      </div>
    </div>
  )
}
