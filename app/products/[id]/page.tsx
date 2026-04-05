import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MOCK_PRODUCTS } from '../../../constants'
import PDPClient from './PDPClient'
import { GoogleGenAI } from '@google/genai'

type Props = { params: Promise<{ id: string }> }

// Generate AI bullet summary server-side
async function getAiSummary(name: string, category: string, description: string): Promise<string[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' })
    const res = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `You are a product advisor for eMerkato, an Ethiopian marketplace.
Give exactly 3 short bullet points (max 15 words each) explaining why "${name}" (${category}) is a great buy.
Context: ${description}
Format: return only a JSON array of 3 strings, no markdown.`,
    })
    const text = res.text?.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '') || '[]'
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed.slice(0, 3) : []
  } catch {
    return [
      'Authentic Ethiopian craftsmanship with premium quality materials',
      'Escrow-protected purchase — your money is safe until delivery',
      'Supports local artisans and traditional Ethiopian culture',
    ]
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = MOCK_PRODUCTS.find(p => p.id === id)
  if (!product) return { title: 'Product Not Found — eMerkato' }
  return {
    title: `${product.name} — eMerkato`,
    description: product.description,
    openGraph: { images: [product.image] },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = MOCK_PRODUCTS.find(p => p.id === id)
  if (!product) notFound()

  // Complementary products (same category or different, exclude self)
  const complementary = MOCK_PRODUCTS.filter(p => p.id !== id).slice(0, 2)

  // Mock reviews
  const reviews = [
    { id: 'r1', author: 'Tigist A.', rating: 5, date: '2026-03-20', comment: 'Absolutely beautiful quality. The embroidery is stunning and the fabric feels premium.', verified: true, image: `https://picsum.photos/seed/rev1/80/80` },
    { id: 'r2', author: 'Dawit M.', rating: 5, date: '2026-03-15', comment: 'Exactly as described. Fast delivery to Addis. Will order again!', verified: true, image: null },
    { id: 'r3', author: 'Sara K.', rating: 4, date: '2026-03-10', comment: 'Great product, slightly different shade than the photo but still lovely.', verified: false, image: `https://picsum.photos/seed/rev3/80/80` },
    { id: 'r4', author: 'Yonas B.', rating: 5, date: '2026-02-28', comment: 'Perfect for the holiday season. My family loved it.', verified: true, image: null },
    { id: 'r5', author: 'Hana T.', rating: 3, date: '2026-02-20', comment: 'Good quality but took longer than expected to arrive.', verified: true, image: null },
  ]

  // Cultural metadata
  const culturalMeta: Record<string, { origin: string; artisan: string; technique: string; trustScore: number }> = {
    'Habesha Clothes': { origin: 'Gondar, Amhara Region', artisan: 'Weaving Cooperative of Gondar', technique: 'Hand-loom weaving with cotton threads', trustScore: 4.8 },
    'Coffee Sets (Jebena)': { origin: 'Sidama Region', artisan: 'Sidama Clay Artisans Guild', technique: 'Hand-thrown clay, kiln-fired', trustScore: 4.7 },
    'Spices (Berbere)': { origin: 'Amhara Region', artisan: 'Stone-ground by local cooperatives', technique: 'Sun-dried, stone-ground blend', trustScore: 4.9 },
    'Ceremonial Wear': { origin: 'Gamo Highlands, SNNPR', artisan: 'Dorze Weavers Association', technique: 'Traditional Dorze cotton weaving', trustScore: 4.6 },
    'Religious Goods': { origin: 'Lalibela, Amhara', artisan: 'Lalibela Craftsmen', technique: 'Hand-carved and hand-painted', trustScore: 4.5 },
  }

  const cultural = culturalMeta[product.category] || null
  const aiSummary = await getAiSummary(product.name, product.category, product.description)

  return (
    <PDPClient
      product={product}
      complementary={complementary}
      reviews={reviews}
      aiSummary={aiSummary}
      cultural={cultural}
    />
  )
}
