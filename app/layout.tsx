import type { Metadata } from 'next'
import '../styles/globals.css'
import GlobalHeader from './components/GlobalHeader'
import GlobalBottomNav from './components/GlobalBottomNav'
import { CartProvider } from '../components/CartContext'
import { AuthProvider } from '../components/AuthContext'

export const metadata: Metadata = {
  title: 'eMerkato — Ethiopian Digital Marketplace',
  description: 'Shop local crafts, cultural goods, and global brands. Delivered across Ethiopia.',
}

/**
 * Global root layout.
 * Renders the shared Header and BottomNav.
 * Vendor pages (app/at/[vendor_slug]) override the header slot via their own layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 selection:bg-orange-200 selection:text-orange-900">
        <AuthProvider>
          <CartProvider>
            <GlobalHeader />
            <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
              {children}
            </main>
            <GlobalBottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
