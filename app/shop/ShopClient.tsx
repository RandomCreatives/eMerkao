'use client'

import React, { useState, useMemo } from 'react'
import { Filter, X, SlidersHorizontal, Search } from 'lucide-react'
import { MOCK_PRODUCTS, CULTURAL_CATEGORIES, REGIONS } from '../../constants'
import ProductCard from '../../components/ProductCard'

const categories = ['All', ...CULTURAL_CATEGORIES, 'Electronics', 'General']

export default function ShopClient() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [priceRange, setPriceRange] = useState(50000)
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [onlyTrusted, setOnlyTrusted] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS]
    if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory)
    result = result.filter(p => p.price <= priceRange)
    if (selectedLocation !== 'All') result = result.filter(p => p.location === selectedLocation)
    if (onlyTrusted) result = result.filter(p => p.isTrusted)
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break
      case 'price-high': result.sort((a, b) => b.price - a.price); break
      case 'rating': result.sort((a, b) => b.rating - a.rating); break
      default: result.sort((a, b) => b.id.localeCompare(a.id))
    }
    return result
  }, [selectedCategory, priceRange, selectedLocation, onlyTrusted, sortBy])

  const Filters = () => (
    <div className="space-y-8">
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Categories</h4>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`w-full text-left px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              selectedCategory === cat ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Max Price (ETB)</h4>
        <input
          type="range" min={0} max={50000} step={500}
          value={priceRange}
          onChange={e => setPriceRange(Number(e.target.value))}
          className="w-full accent-orange-600"
        />
        <div className="text-sm font-black text-stone-900">{priceRange.toLocaleString()} ETB</div>
      </div>
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Location</h4>
        {['All', ...REGIONS].map(loc => (
          <button
            key={loc}
            onClick={() => setSelectedLocation(loc)}
            className={`w-full text-left px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              selectedLocation === loc ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={onlyTrusted} onChange={e => setOnlyTrusted(e.target.checked)} className="accent-orange-600 w-4 h-4" />
        <span className="text-sm font-bold text-stone-700">Trusted Sellers Only</span>
      </label>
    </div>
  )

  return (
    <div className="flex gap-8">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-none">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm sticky top-24">
          <h3 className="font-black text-xs uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </h3>
          <Filters />
        </div>
      </aside>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="bg-stone-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[2.5rem] p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-sm uppercase tracking-widest">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}><X className="w-6 h-6" /></button>
            </div>
            <Filters />
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-500 text-sm font-bold">{filteredProducts.length} products</p>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white border border-stone-200 rounded-2xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="font-black text-stone-900 text-lg">No products found</h3>
            <p className="text-stone-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => {}} onBuyNow={() => {}} onAddToCart={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
