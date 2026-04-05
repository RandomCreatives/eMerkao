'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Product } from '../../../types'
import { useCart } from '../../../components/CartContext'
import { CartProduct } from '../../../components/CartContext'

interface Props {
  product: Product
  buyButtonRef: React.RefObject<HTMLDivElement | null>
}

const SECTIONS = ['About', 'Details', 'Reviews', 'Store']

export default function StickyNav({ product, buyButtonRef }: Props) {
  const [visible, setVisible] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )
    if (buyButtonRef.current) observer.observe(buyButtonRef.current)
    return () => observer.disconnect()
  }, [buyButtonRef])

  const scrollTo = (id: string) => {
    document.getElementById(`section-${id.toLowerCase()}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleAdd = () => {
    addItem({
      ...product,
      vendorId: product.sellerId,
      vendorName: `Vendor ${product.sellerId}`,
      vendorSlug: product.sellerId,
    } as CartProduct)
  }

  if (!visible) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img src={product.image} alt={product.name} className="w-9 h-9 rounded-xl object-cover flex-none" />
          <p className="font-black text-stone-900 text-sm truncate hidden sm:block">{product.name}</p>
          <span className="font-black text-orange-600 text-sm flex-none">{product.price.toLocaleString()} ETB</span>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1">
            {SECTIONS.map(s => (
              <button key={s} onClick={() => scrollTo(s)}
                className="px-3 py-1.5 text-xs font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors">
                {s}
              </button>
            ))}
          </nav>
          <button onClick={handleAdd}
            className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20">
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
