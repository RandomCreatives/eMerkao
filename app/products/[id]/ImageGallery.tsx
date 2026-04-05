'use client'

import React, { useState } from 'react'
import { ZoomIn } from 'lucide-react'

interface Props {
  images: string[]
  name: string
}

export default function ImageGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  return (
    <div className="flex gap-4">
      {/* Vertical thumbnails */}
      <div className="hidden sm:flex flex-col gap-2 w-16 flex-none">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
              active === i ? 'border-orange-600 shadow-md' : 'border-stone-200 hover:border-stone-400'
            }`}
          >
            <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image with zoom */}
      <div className="flex-1 relative">
        <div
          className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 cursor-zoom-in group"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
        >
          <img
            src={images[active]}
            alt={name}
            className={`w-full h-full object-cover transition-transform duration-100 ${zoomed ? 'scale-150' : 'scale-100'}`}
            style={zoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
          />
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4 text-stone-600" />
          </div>
        </div>

        {/* Mobile dot nav */}
        <div className="flex justify-center gap-2 mt-3 sm:hidden">
          {images.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all ${active === i ? 'bg-orange-600 w-4' : 'bg-stone-300'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
