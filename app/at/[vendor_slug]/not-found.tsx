import Link from 'next/link'
import { Store } from 'lucide-react'

export default function VendorNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 px-4">
      <div className="w-20 h-20 bg-stone-100 rounded-[2.5rem] flex items-center justify-center">
        <Store className="w-10 h-10 text-stone-400" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Vendor not found</h1>
        <p className="text-stone-500 text-sm mt-2">This store doesn't exist or may have been removed.</p>
      </div>
      <Link href="/" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-colors">
        Back to eMerkato
      </Link>
    </div>
  )
}
