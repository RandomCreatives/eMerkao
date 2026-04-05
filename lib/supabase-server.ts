import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

/**
 * Server-side Supabase client for use in Server Components, layouts, and pages.
 * Uses Next.js 15 async cookies() pattern.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  )
}

/**
 * Fetch vendor by slug — checks both `vendors` table (new) and `sellers` table (legacy).
 */
export async function getVendorBySlug(slug: string) {
  const supabase = await createSupabaseServerClient()

  // Try new vendors table first
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, profiles(*)')
    .eq('slug', slug)
    .single()

  if (vendor) return vendor

  // Fallback to sellers table (legacy store_slug column)
  const { data: seller } = await supabase
    .from('sellers')
    .select('*, profiles(*)')
    .eq('store_slug', slug)
    .single()

  return seller ?? null
}

/**
 * Fetch products for a given seller ID from Supabase.
 */
export async function getProductsBySeller(sellerId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, is_cultural)')
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}
