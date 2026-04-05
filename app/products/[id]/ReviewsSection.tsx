'use client'

import React, { useState } from 'react'
import { Star, CheckCircle } from 'lucide-react'

interface Review {
  id: string
  author: string
  rating: number
  date: string
  comment: string
  verified: boolean
  image: string | null
}

interface Props {
  reviews: Review[]
  avgRating: number
}

export default function ReviewsSection({ reviews, avgRating }: Props) {
  const [filter, setFilter] = useState<number | null>(null)

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100),
  }))

  const filtered = filter ? reviews.filter(r => r.rating === filter) : reviews

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Overall score */}
        <div className="text-center sm:w-40 flex-none">
          <p className="text-6xl font-black text-stone-900">{avgRating.toFixed(1)}</p>
          <div className="flex justify-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'text-orange-500 fill-orange-500' : 'text-stone-200 fill-stone-200'}`} />
            ))}
          </div>
          <p className="text-stone-400 text-xs font-bold mt-1">{reviews.length} reviews</p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-2">
          {distribution.map(({ star, count, pct }) => (
            <button
              key={star}
              onClick={() => setFilter(filter === star ? null : star)}
              className={`w-full flex items-center gap-3 group transition-opacity ${filter && filter !== star ? 'opacity-40' : ''}`}
            >
              <span className="text-xs font-black text-stone-600 w-8 text-right flex-none">{star}★</span>
              <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-stone-400 w-8 flex-none">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {filter && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-stone-600">Showing {filter}-star reviews</span>
          <button onClick={() => setFilter(null)} className="text-xs text-orange-600 font-black hover:underline">Clear</button>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-6">
        {filtered.map(review => (
          <div key={review.id} className="border-b border-stone-100 pb-6 last:border-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-black text-sm flex-none">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-stone-900 text-sm">{review.author}</p>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-orange-500 fill-orange-500' : 'text-stone-200 fill-stone-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-stone-400 text-xs font-bold flex-none">{review.date}</span>
            </div>
            <p className="text-stone-600 text-sm mt-3 leading-relaxed">{review.comment}</p>
            {review.image && (
              <img src={review.image} alt="Review" className="mt-3 w-20 h-20 rounded-2xl object-cover border border-stone-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
