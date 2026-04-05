'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingCart, Zap, ShieldCheck, Truck, Star,
  ChevronDown, ChevronUp, Sparkles, MapPin, Award, Package
} from 'lucide-react'
import { Product } from '../../../types'
import { useCart, CartProduct } from '../../../components/CartContext'
import StickyNav from './StickyNav'
import ImageGallery from './ImageGallery'
import ReviewsSection from './ReviewsSection'

interface Review {
  id: string; author: string; rating: number; date: string
  comment: string; verified: boolean; image: string | null
}

interface CulturalMeta {
  origin: string; artisan: string; technique: string; trustScore: number
}

interface Props {
  product: Product
  complementary: Product[]
  reviews: Review[]
  aiSummary: string[]
  cultural: CulturalMeta | null
}

const DETAILS: Record<string, Record<string, string>> = {
  'Habesha Clothes': { Material: 'Pure cotton', Weave: 'Hand-loom', Embroidery: 'Gold thread', Care: 'Hand wash cold', Sizes: 'XS – 3XL' },
  'Coffee Sets (Jebena)': { Material: 'Natural clay', Capacity: '1.5 litres', Finish: 'Unglazed traditional', Includes: 'Jebena + 6 cups', Weight: '~800g' },
  'Spices (Berbere)': { Weight: '500g', Grind: 'Stone-ground', Heat: 'Medium-hot', Shelf: '18 months', Allergens: 'None' },
  'Electronics': { OS: 'Android 13', RAM: '8GB', Storage: '128GB', Battery: '5000mAh', Display: '6.78" FHD+' },
}

function toCartProduct(p: Product): CartProduct {
  return { ...p, vendorId: p.sellerId, vendorName: `Vendor ${p.sellerId}`, vendorSlug: p.sellerId }
}

export default function PDPClient({ product, complementary, reviews, aiSummary, cultural }: Props) {
  const { addItem, items } = useCart()
  const buyRef = useRef<HTMLDivElement>(null)
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [qty, setQty] = useState(1)
  const [addedBundle, setAddedBundle] = useState(false)

  const inCart = items.some(i => i.product.id === product.id)
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  // Generate gallery images (mock multiple angles)
  const images = [
    product.image,
    product.image.replace('/600/600', '/600/601'),
    product.image.replace('/600/600', '/601/600'),
    product.image.replace('/600/600', '/602/602'),
  ]

  const bundleTotal = product.price + complementary.reduce((s, p) => s + p.price, 0)
  const bundleDiscount = Math.round(bundleTotal * 0.05)

  const handleAddToCart = () => addItem(toCartProduct(product), qty)

  const handleAddBundle = () => {
    addItem(toCartProduct(product), 1)
    complementary.forEach(p => addItem(toCartProduct(p), 1))
    setAddedBundle(true)
  }

  const scrollTo = (id: string) =>
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <StickyNav product={product} buyButtonRef={buyRef} />

      <div className="space-y-12 pb-24 md:pb-12">

        {/* ── HEADER GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12" id="section-about">
          {/* Left: Gallery */}
          <ImageGallery images={images} name={product.name} />

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Category + rating */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-orange-500 fill-orange-500' : 'text-stone-200 fill-stone-200'}`} />
                  ))}
                </div>
                <button onClick={() => scrollTo('reviews')} className="text-xs font-bold text-stone-500 hover:text-orange-600 transition-colors">
                  ({reviews.length})
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-stone-900 tracking-tight leading-tight">{product.name}</h1>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {product.isCultural && (
                <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Award className="w-3 h-3" /> Verified Cultural Item
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Secure Escrow
              </span>
              {product.location === 'Addis Ababa' && (
                <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Zap className="w-3 h-3" /> 24h Addis Delivery
                </span>
              )}
              {product.isTrusted && (
                <span className="flex items-center gap-1.5 bg-stone-100 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> Trusted Seller
                </span>
              )}
            </div>

            {/* Price */}
            <div>
              <p className="text-4xl font-black text-stone-900">{product.price.toLocaleString()} <span className="text-xl text-stone-400 font-bold">ETB</span></p>
              <p className="text-stone-400 text-xs font-bold mt-1">Escrow-protected · Funds released on delivery confirmation</p>
            </div>

            {/* Description */}
            <p className="text-stone-600 text-sm leading-relaxed">{product.description}</p>

            {/* Qty + Add to Cart */}
            <div ref={buyRef} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-200 rounded-2xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 font-black text-stone-700 hover:bg-stone-100 transition-colors">−</button>
                  <span className="px-4 font-black text-stone-900 text-sm">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="px-4 py-3 font-black text-stone-700 hover:bg-stone-100 transition-colors">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                    inCart
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'
                      : 'bg-orange-600 text-white shadow-orange-600/20 hover:bg-orange-700'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {inCart ? 'Added ✓' : 'Add to Cart'}
                </button>
              </div>
              <Link
                href="/checkout"
                className="w-full block text-center bg-stone-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-stone-800 transition-colors"
              >
                Buy Now →
              </Link>
            </div>

            {/* Delivery info */}
            <div className="bg-stone-50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                <Truck className="w-4 h-4 text-orange-600" />
                <span>Standard delivery: 3–5 days · Express (Addis): Same day</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>Ships from {product.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI SUMMARY ── */}
        {aiSummary.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-indigo-900 text-sm uppercase tracking-tight">Gemini AI Summary</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Why this is a great buy</p>
              </div>
            </div>
            <ul className="space-y-2">
              {aiSummary.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-indigo-800 font-medium">
                  <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 font-black text-[10px] flex items-center justify-center flex-none mt-0.5">{i + 1}</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── TECHNICAL DETAILS ── */}
        <div id="section-details">
          <button
            onClick={() => setDetailsOpen(o => !o)}
            className="w-full flex items-center justify-between py-4 border-b border-stone-200"
          >
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">Additional Details</h2>
            {detailsOpen ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
          </button>

          {detailsOpen && (
            <div className="pt-6 space-y-6">
              {/* Spec grid */}
              {DETAILS[product.category] && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(DETAILS[product.category]).map(([k, v]) => (
                    <div key={k} className="bg-stone-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{k}</p>
                      <p className="font-black text-stone-900 text-sm mt-1">{v}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Cultural metadata */}
              {cultural && (
                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 space-y-4">
                  <h3 className="font-black text-amber-900 text-sm uppercase tracking-tight flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" /> Cultural Origin
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Origin', value: cultural.origin },
                      { label: 'Artisan', value: cultural.artisan },
                      { label: 'Technique', value: cultural.technique },
                      { label: 'Trust Score', value: `${cultural.trustScore} / 5 ★` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">{label}</p>
                        <p className="font-black text-amber-900 text-sm mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FREQUENTLY BOUGHT TOGETHER ── */}
        {complementary.length > 0 && (
          <div>
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight mb-6">Frequently Bought Together</h2>
            <div className="bg-white rounded-3xl border border-stone-200 p-6">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {/* Main product */}
                <div className="flex-none text-center space-y-2 w-28">
                  <div className="relative">
                    <img src={product.image} alt={product.name} className="w-28 h-28 rounded-2xl object-cover border-2 border-orange-600" />
                    <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">This item</span>
                  </div>
                  <p className="text-xs font-black text-stone-900 line-clamp-2">{product.name}</p>
                  <p className="text-orange-600 font-black text-xs">{product.price.toLocaleString()} ETB</p>
                </div>

                {complementary.map((cp, i) => (
                  <React.Fragment key={cp.id}>
                    <span className="text-2xl text-stone-300 font-black flex-none">+</span>
                    <div className="flex-none text-center space-y-2 w-28">
                      <img src={cp.image} alt={cp.name} className="w-28 h-28 rounded-2xl object-cover border border-stone-200" />
                      <p className="text-xs font-black text-stone-900 line-clamp-2">{cp.name}</p>
                      <p className="text-orange-600 font-black text-xs">{cp.price.toLocaleString()} ETB</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-stone-100">
                <div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Bundle Price</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-stone-900">{(bundleTotal - bundleDiscount).toLocaleString()} ETB</span>
                    <span className="text-sm text-stone-400 line-through">{bundleTotal.toLocaleString()}</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Save {bundleDiscount.toLocaleString()} ETB</span>
                  </div>
                </div>
                <button
                  onClick={handleAddBundle}
                  disabled={addedBundle}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    addedBundle
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 text-white hover:bg-orange-600'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addedBundle ? 'Added to Cart ✓' : 'Add All 3 to Cart'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        <div id="section-reviews">
          <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight mb-6">
            Customer Reviews
            <span className="ml-3 text-stone-400 font-bold text-base">({reviews.length})</span>
          </h2>
          <ReviewsSection reviews={reviews} avgRating={avgRating} />
        </div>

        {/* ── VENDOR STORE ── */}
        <div id="section-store" className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-700 font-black text-2xl flex-none">
            {product.sellerId.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-black text-stone-900">Vendor {product.sellerId}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {product.isTrusted && (
                <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> Trusted
                </span>
              )}
              <span className="flex items-center gap-1 text-stone-400 text-xs font-bold">
                <Star className="w-3 h-3 text-orange-500 fill-orange-500" /> {product.rating} rating
              </span>
              <span className="flex items-center gap-1 text-stone-400 text-xs font-bold">
                <MapPin className="w-3 h-3" /> {product.location}
              </span>
            </div>
          </div>
          <Link
            href={`/at/${product.sellerId}`}
            className="flex-none bg-stone-900 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors"
          >
            Visit Store →
          </Link>
        </div>
      </div>

      {/* ── MOBILE FIXED BUY BUTTON ── */}
      <div className="fixed bottom-16 left-0 right-0 md:hidden z-30 px-4 pb-2">
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all ${
            inCart
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-orange-600 text-white shadow-orange-600/30'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {inCart ? 'Added to Cart ✓' : `Add to Cart · ${product.price.toLocaleString()} ETB`}
        </button>
      </div>
    </>
  )
}
