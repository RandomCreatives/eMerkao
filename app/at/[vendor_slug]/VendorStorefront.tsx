'use client'

import React, { useState, useMemo } from 'react'
import { Package, Search } from 'lucide-react'
import { useCart } from '../../../components/CartContext'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
  description: string | null
  is_cultural: boolean
  categories?: { name: string; is_cultural: boolean } | null
}

type Vendor = {
  id: string
  store_name: string
  store_description?: string | null
  logo_url?: string | null
  brand_color?: string | null
  is_trusted_seller?: boolean
  average_rating?: number | null
  profiles?: { full_name: string; region?: string | null } | null
}

type Props = {
  vendor: Vendor
  products: Product[]
}

export default function VendorStorefront({ vendor, products }: Props) {
  const [query, setQuery] = useState('')
  const { addItem } = useCart()

  const filtered = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.categories?.name.toLowerCase().includes(q)
    )
  }, [products, query])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      category: product.categories?.name || '',
      description: product.description || '',
      location: '',
      rating: 0,
      sellerId: vendor.id,
      vendorName: vendor.store_name,
      vendorSlug: (vendor as any).slug || vendor.id,
    } as any)
  }

  return (
    <div className="space-y-6">
      {/* Vendor-scoped search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder={`Search in ${vendor.store_name}...`}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
        {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        {query && ` matching "${query}"`}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-black text-stone-900 text-lg">
            {products.length === 0 ? 'No products yet' : 'No results found'}
          </h3>
          <p className="text-stone-500 text-sm mt-2">
            {products.length === 0
              ? "This vendor hasn't listed any products."
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="aspect-square bg-stone-100 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Package className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="p-4">
                {product.categories?.name && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">
                    {product.categories.name}
                  </span>
                )}
                <h3 className="font-black text-stone-900 text-sm mt-1 line-clamp-2">{product.name}</h3>
                <p className="text-orange-600 font-black text-base mt-2">
                  {product.price.toLocaleString()}{' '}
                  <span className="text-xs font-bold text-stone-400">ETB</span>
                </p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-3 w-full bg-stone-900 text-white py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
