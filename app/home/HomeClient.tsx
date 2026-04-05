'use client'

// Re-exports the existing Home page component adapted for App Router.
// Navigation is handled via next/navigation instead of prop callbacks.
import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { MOCK_PRODUCTS, CULTURAL_CATEGORIES } from '../../constants'
import ProductCard from '../../components/ProductCard'
import { ArrowRight, Zap, Award, Truck, Sparkles } from 'lucide-react'
import { getSmartSuggestions } from '../../services/geminiService'

export default function HomeClient() {
  const [aiSuggestions, setAiSuggestions] = useState<{ name: string; reason: string }[]>([])
  const [loadingAi, setLoadingAi] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingAi(true)
      const suggestions = await getSmartSuggestions('Habesha Kemis, Berbere, Coffee Sets')
      setAiSuggestions(suggestions)
      setLoadingAi(false)
    }
    fetchSuggestions()
  }, [])

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero */}
      <section className="relative min-h-[350px] md:h-[450px] w-full bg-stone-900 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=2070&auto=format&fit=crop"
          alt="Merkato Marketplace"
          className="w-full h-full object-cover opacity-40 absolute inset-0 scale-105"
        />
        <div className="relative h-full flex flex-col justify-center px-6 md:px-16 py-12 text-white max-w-4xl z-10">
          <div className="inline-flex items-center gap-2 bg-orange-600/40 backdrop-blur-xl border border-orange-500/50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 w-fit animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping" />
            <Sparkles className="w-3 h-3" /> Digitalizing Merkato
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[0.9] tracking-tighter">
            The heart of <span className="text-orange-500">Ethiopian</span> trade, digitised.
          </h1>
          <p className="text-base md:text-xl text-stone-200 mb-10 max-w-md leading-relaxed font-medium">
            Join thousands of merchants. Shop local crafts and global brands delivered in Addis within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-orange-900/40 text-center uppercase text-xs tracking-widest flex items-center justify-center gap-2"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/seller"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-10 py-5 rounded-2xl font-black transition-all text-center text-xs uppercase tracking-widest"
            >
              Open a Store
            </Link>
          </div>
        </div>
      </section>

      {/* AI Suggestions */}
      <section className="bg-gradient-to-br from-indigo-50 to-orange-50 p-8 rounded-[3rem] border border-white/50 shadow-inner overflow-hidden relative">
        <div className="absolute top-4 right-8 opacity-10">
          <Sparkles className="w-24 h-24 text-indigo-600 rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-indigo-900">AI Personal Shopper</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Powered by Gemini</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loadingAi
              ? [1, 2, 3].map(i => (
                  <div key={i} className="bg-white/60 animate-pulse h-24 rounded-3xl border border-white/50" />
                ))
              : aiSuggestions.map((s, idx) => (
                  <Link
                    key={idx}
                    href="/shop"
                    className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-black uppercase text-indigo-600 mb-1 flex justify-between">
                      {s.name}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-stone-600 text-xs font-medium leading-relaxed">{s.reason}</p>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-4 md:pb-0 snap-x">
        {[
          { bg: 'bg-orange-50 border-orange-100/50', iconBg: 'bg-orange-600', Icon: Zap, title: 'Express Delivery', sub: 'Under 24hrs in Addis Ababa' },
          { bg: 'bg-stone-100 border-stone-200/50', iconBg: 'bg-stone-900', Icon: Award, title: 'Trusted Quality', sub: 'Verified Merkato Vendors' },
          { bg: 'bg-emerald-50 border-emerald-100/50', iconBg: 'bg-emerald-600', Icon: Truck, title: 'Nationwide', sub: 'Shipping to all regions 🇪🇹' },
        ].map(({ bg, iconBg, Icon, title, sub }) => (
          <div key={title} className={`flex-none w-[280px] md:w-auto ${bg} p-6 rounded-[2rem] flex items-center gap-5 snap-center border`}>
            <div className={`${iconBg} p-3.5 rounded-2xl text-white shadow-lg`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight text-stone-900">{title}</h3>
              <p className="text-stone-500 text-xs font-medium">{sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Cultural Categories */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">Habesha Cultural Collections</h2>
            <div className="h-1 w-12 bg-orange-600 rounded-full mt-1" />
          </div>
          <Link href="/shop" className="text-orange-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto pb-4 md:pb-0 snap-x">
          {CULTURAL_CATEGORIES.map((cat, i) => (
            <Link
              key={cat}
              href="/shop"
              className="flex-none w-[180px] md:w-auto group cursor-pointer relative aspect-[3/4] rounded-3xl overflow-hidden bg-stone-200 snap-start shadow-md"
            >
              <img
                src={`https://picsum.photos/seed/cat${i}/400/533`}
                alt={cat}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-transparent to-transparent flex items-end p-5">
                <span className="text-white font-black text-xs uppercase tracking-widest">{cat}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tighter uppercase">Handpicked for You</h2>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Based on local trends</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {MOCK_PRODUCTS.slice(0, 4).map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => {}}
              onBuyNow={() => {}}
              onAddToCart={() => {}}
            />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            href="/shop"
            className="group flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl"
          >
            Explore Full Catalog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 rounded-[2.5rem] p-8 md:p-16 text-center space-y-6 relative overflow-hidden">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter relative z-10">
          Ready to sell on <span className="text-orange-600">eMerkato?</span>
        </h2>
        <p className="text-stone-400 max-w-lg mx-auto text-sm md:text-base font-medium relative z-10">
          Reach millions of customers across Ethiopia.
        </p>
        <div className="pt-4 relative z-10">
          <Link
            href="/seller"
            className="bg-white text-stone-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 hover:text-white transition-all shadow-xl inline-block"
          >
            Create Merchant Account
          </Link>
        </div>
      </section>
    </div>
  )
}
