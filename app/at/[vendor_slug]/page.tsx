import { notFound } from 'next/navigation'
import { getVendorBySlug, getProductsBySeller } from '../../../lib/supabase-server'
import { MOCK_PRODUCTS } from '../../../constants'
import VendorStorefront from './VendorStorefront'

// Next.js 15 async params pattern
type Props = {
  params: Promise<{ vendor_slug: string }>
}

export default async function VendorPage({ params }: Props) {
  // Await params — required in Next.js 15
  const { vendor_slug } = await params

  const vendor = await getVendorBySlug(vendor_slug)
  if (!vendor) notFound()

  // Fetch products from Supabase filtered by this vendor's seller ID
  let products = await getProductsBySeller(vendor.id)

  // Fall back to mock data filtered by sellerId if Supabase isn't configured
  if (!products.length) {
    products = MOCK_PRODUCTS
      .filter(p => p.sellerId === vendor.id || p.sellerId === 's1') // demo fallback
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image,
        description: p.description,
        is_cultural: p.isCultural ?? false,
        categories: { name: p.category, is_cultural: p.isCultural ?? false },
      })) as any[]
  }

  return <VendorStorefront vendor={vendor} products={products} />
}
