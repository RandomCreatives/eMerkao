import Link from 'next/link'
import { Package } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="text-center py-24 space-y-4">
      <Package className="w-16 h-16 text-stone-200 mx-auto" />
      <h2 className="text-2xl font-black text-stone-900">Product not found</h2>
      <p className="text-stone-400 text-sm">This product may have been removed or the link is incorrect.</p>
      <Link href="/shop" className="inline-block bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
        Browse Shop
      </Link>
    </div>
  )
}
