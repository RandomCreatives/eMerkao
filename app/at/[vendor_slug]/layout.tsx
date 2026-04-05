import type { Metadata } from 'next'
import { getVendorBySlug } from '../../../lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Store, ShieldCheck, Clock, Star, MapPin } from 'lucide-react'

type Props = {
  params: Promise<{ vendor_slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: Promise<{ vendor_slug: string }> }): Promise<Metadata> {
  const { vendor_slug } = await params
  const vendor = await getVendorBySlug(vendor_slug)
  if (!vendor) return { title: 'Vendor Not Found — eMerkato' }
  return {
    title: `${vendor.store_name} — eMerkato`,
    description: vendor.store_description ?? `Shop from ${vendor.store_name} on eMerkato`,
  }
}

export default async function VendorLayout({ params, children }: Props) {
  const { vendor_slug } = await params
  const vendor = await getVendorBySlug(vendor_slug)
  if (!vendor) notFound()

  const brandColor = (vendor as any).brand_color ?? '#1c1917'
  const trustScore = (vendor as any).trust_score ?? null
  const yearsInMerkato = (vendor as any).years_in_merkato ?? null
  const avgDeliveryDays = (vendor as any).avg_delivery_days ?? null
  const region = (vendor as any).ethiopia_region ?? vendor.profiles?.region ?? null

  return (
    <>
      {/* Vendor-branded header */}
      <header
        className="sticky top-0 z-50 border-b border-white/10 shadow-sm"
        style={{ backgroundColor: brandColor }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href={`/at/${vendor_slug}`} className="flex items-center gap-3">
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt={vendor.store_name} className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="bg-white/20 p-2 rounded-xl">
                <Store className="text-white w-5 h-5" />
              </div>
            )}
            <span className="text-white font-black text-lg tracking-tight">{vendor.store_name}</span>
            {vendor.is_trusted_seller && (
              <span className="hidden sm:flex items-center gap-1 bg-white/20 text-white px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Trusted
              </span>
            )}
          </Link>
          <Link
            href="/"
            className="text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            ← eMerkato
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Vendor Profile Sidebar */}
          <aside className="lg:w-64 flex-none space-y-4">
            {/* Trust Badge */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                {vendor.logo_url ? (
                  <img src={vendor.logo_url} alt={vendor.store_name} className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {vendor.store_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-black text-stone-900 text-sm">{vendor.store_name}</p>
                  {vendor.is_trusted_seller && (
                    <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest mt-0.5">
                      <ShieldCheck className="w-3 h-3" /> Trusted Seller
                    </span>
                  )}
                </div>
              </div>

              {vendor.store_description && (
                <p className="text-stone-500 text-xs leading-relaxed">{vendor.store_description}</p>
              )}

              <div className="space-y-2 pt-2 border-t border-stone-100">
                {trustScore !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-500 font-bold">
                      <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> Trust Score
                    </span>
                    <span className="font-black text-stone-900">{Number(trustScore).toFixed(1)} / 5</span>
                  </div>
                )}
                {yearsInMerkato !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-500 font-bold">
                      <Store className="w-3.5 h-3.5" /> Years in Merkato
                    </span>
                    <span className="font-black text-stone-900">{yearsInMerkato} yrs</span>
                  </div>
                )}
                {avgDeliveryDays !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-500 font-bold">
                      <Clock className="w-3.5 h-3.5" /> Avg Delivery
                    </span>
                    <span className="font-black text-stone-900">{avgDeliveryDays} days</span>
                  </div>
                )}
                {region && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-500 font-bold">
                      <MapPin className="w-3.5 h-3.5" /> Region
                    </span>
                    <span className="font-black text-stone-900">{region}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Back to eMerkato */}
            <Link
              href="/shop"
              className="block text-center bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors"
            >
              Browse All Stores
            </Link>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </>
  )
}
