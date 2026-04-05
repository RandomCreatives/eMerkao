'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { X, Trash2, Store, ShieldCheck, ShoppingBag } from 'lucide-react'
import { useCart } from './CartContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, grandTotal, totalItems, itemsByVendor, updateQty, removeItem } = useCart()

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer — slides up from bottom on mobile, from right on desktop */}
      <div className={`fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-out
        bottom-0 left-0 right-0 rounded-t-[2rem] max-h-[90vh] flex flex-col
        md:bottom-auto md:top-0 md:right-0 md:left-auto md:w-[420px] md:h-full md:rounded-none md:rounded-l-[2rem]
        ${open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <h2 className="font-black text-stone-900 uppercase tracking-tight">
              Cart {totalItems > 0 && <span className="text-stone-400 font-bold">({totalItems})</span>}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 space-y-4">
              <ShoppingBag className="w-14 h-14 text-stone-200" />
              <p className="font-black text-stone-400 text-sm uppercase tracking-widest">Cart is empty</p>
              <button onClick={onClose}>
                <Link href="/shop" className="text-orange-600 font-black text-xs uppercase tracking-widest hover:underline">
                  Browse Shop →
                </Link>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {Object.entries(itemsByVendor).map(([key, group]) => (
                <div key={key}>
                  {/* Vendor header */}
                  <div className="px-6 py-3 bg-stone-50 flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                      Sold by {group.vendorName}
                    </span>
                  </div>

                  {/* Items */}
                  {group.items.map(({ product, qty }) => (
                    <div key={product.id} className="px-6 py-4 flex gap-4 items-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-2xl object-cover flex-none"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-stone-900 text-sm truncate">{product.name}</p>
                        <p className="text-orange-600 font-black text-xs mt-0.5">{product.price.toLocaleString()} ETB</p>
                        {/* Qty stepper */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(product.id, qty - 1)}
                            className="w-6 h-6 rounded-lg bg-stone-100 font-black text-stone-700 hover:bg-stone-200 transition-colors text-xs flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="font-black text-sm w-4 text-center">{qty}</span>
                          <button
                            onClick={() => updateQty(product.id, qty + 1)}
                            className="w-6 h-6 rounded-lg bg-stone-100 font-black text-stone-700 hover:bg-stone-200 transition-colors text-xs flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-none">
                        <p className="font-black text-stone-900 text-sm">{(product.price * qty).toLocaleString()}</p>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Vendor subtotal */}
                  <div className="px-6 py-2 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    Subtotal: {group.subtotal.toLocaleString()} ETB
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-black text-stone-900 text-lg">Total</span>
              <span className="font-black text-orange-600 text-xl">{grandTotal.toLocaleString()} ETB</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-indigo-500 flex-none" />
              Escrow protected · Funds released on delivery
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full block text-center bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20"
            >
              Proceed to Checkout →
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="w-full block text-center text-stone-400 text-xs font-bold hover:text-stone-600 transition-colors"
            >
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
