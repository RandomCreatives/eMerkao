'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, Search, Store, LogOut } from 'lucide-react'
import { useAuth } from '../../components/AuthContext'
import { useCart } from '../../components/CartContext'
import CartDrawer from '../../components/CartDrawer'

export default function GlobalHeader() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { totalItems } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-none">
            <div className="bg-orange-600 p-2 rounded-lg group-hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20">
              <Store className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-orange-600 hidden sm:block">
              e<span className="text-stone-800">Merkato</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:flex relative">
            <input
              type="text"
              placeholder="Search for products, brands..."
              className="w-full bg-stone-100 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-stone-400 w-4 h-4" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart button — opens drawer */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-stone-600 hover:text-orange-600 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Sell button */}
            <Link
              href="/seller"
              className="hidden md:flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-xl hover:bg-black transition-all font-bold text-sm"
            >
              <Store className="w-4 h-4" />
              <span>Sell</span>
            </Link>

            {/* User */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link href={user.role === 'vendor' || user.role === 'admin' ? '/seller' : '/buyer-dashboard'}>
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || 'User'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-orange-200 hover:border-orange-500 transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-black text-sm hover:bg-orange-200 transition-colors">
                      {(user.full_name || user.telegram_username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="flex items-center gap-1.5 p-2 text-stone-600 hover:text-orange-600 transition-colors">
                <User className="w-6 h-6" />
              </Link>
            )}

            <Link href="/search" className="md:hidden p-2 text-stone-600">
              <Search className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
