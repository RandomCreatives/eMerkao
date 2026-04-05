'use client'

import React from 'react'
import Link from 'next/link'
import { Trash2, ShoppingBag, Store, ShieldCheck } from 'lucide-react'
import { useCart } from '../../components/CartContext'

export default function CartPage() {
  const { items, grandTotal, totalItems, itemsByVendor, updateQty, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <ShoppingBag className="w-16 h-16 text-stone-200 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-stone-900 mb-2">Your cart is empty</h2>
        <p className="text-stone-400 text-sm mb-8">Add some products to get started</p>
        <Link href="/shop" className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
          Browse Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight uppercase">
          Cart <span className="text-stone-400 font-bold text-base">({totalItems} items)</span>
        </h1>
        <button onClick={clearCart} className="text-xs text-stone-400 hover:text-red-500 font-bold transition-colors">
          Clear all
        </button>
      </div>

      {Object.entries(itemsByVendor).map(([key, group]) => (
        <div key={key} className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2 bg-stone-50">
            <Store className="w-4 h-4 text-orange-600" />
            <span className="font-black text-sm text-stone-900 uppercase tracking-tight">
              Items from {group.vendorName}
            </span>
          </div>
          <div className="divide-y divide-stone-100">
            {group.items.map(({ product, qty }) => (
              <div key={product.id} className="p-5 flex gap-4 items-center">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-2xl object-cover flex-none" />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-stone-900 text-sm truncate">{product.name}</p>
                  <p className="text-orange-600 font-black text-sm mt-0.5">{product.price.toLocaleString()} ETB</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(product.id, qty - 1)} className="w-7 h-7 rounded-xl bg-stone-100 font-black text-stone-700 hover:bg-stone-200 transition-colors text-sm">-</button>
                    <span className="font-black text-sm w-4 text-center">{qty}</span>
                    <button onClick={() => updateQty(product.id, qty + 1)} className="w-7 h-7 rounded-xl bg-stone-100 font-black text-stone-700 hover:bg-stone-200 transition-colors text-sm">+</button>
                  </div>
                </div>
                <div className="text-right flex-none">
                  <p className="font-black text-stone-900 text-sm">{(product.price * qty).toLocaleString()} ETB</p>
                  <button onClick={() => removeItem(product.id)} className="mt-2 text-stone-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-stone-50 text-right text-xs font-black text-stone-500 uppercase tracking-widest">
            Subtotal: {group.subtotal.toLocaleString()} ETB
          </div>
        </div>
      ))}

      <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
        <div className="flex justify-between font-black text-stone-900 text-lg">
          <span>Grand Total</span>
          <span className="text-orange-600">{grandTotal.toLocaleString()} ETB</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          Escrow protected — funds released only after you confirm delivery
        </div>
        <Link
          href="/checkout"
          className="w-full block text-center bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors"
        >
          Proceed to Checkout →
        </Link>
        <p className="text-center text-[10px] text-stone-400 font-bold uppercase tracking-widest">
          Separate orders per vendor · Delivery fees at checkout
        </p>
      </div>
    </div>
  )
}
