import React from 'react'
import Link from 'next/link'
import { Star, MapPin, ShieldCheck, ShoppingBag } from 'lucide-react'
import { Product } from '../types'

interface Props {
  product: Product
  onClick?: (section?: string) => void
  onAddToCart?: (name: string) => void
  onBuyNow?: () => void
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-stone-200 hover:shadow-2xl hover:shadow-orange-100 hover:-translate-y-1 transition-all group">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-[4/5] relative overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {product.isCultural && (
              <div className="bg-yellow-400 text-stone-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                Cultural
              </div>
            )}
            {product.isTrusted && (
              <div className="bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Trusted
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4 md:p-5 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] truncate flex-1">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 text-orange-500 fill-current" />
              <span className="text-[10px] font-black text-orange-700">{product.rating}</span>
            </div>
          </div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-black text-stone-900 text-sm md:text-base leading-tight line-clamp-2 hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-stone-400 text-[10px] font-bold uppercase tracking-wider mt-1">
            <MapPin className="w-3 h-3" />
            <span>{product.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-stone-900 leading-none">
              {product.price.toLocaleString()}
            </span>
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest ml-1">ETB</span>
          </div>
          <button
            onClick={e => { e.preventDefault(); onAddToCart?.(product.name) }}
            className="w-10 h-10 bg-stone-900 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-colors"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
