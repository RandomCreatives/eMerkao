'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { Product } from '../types'

export interface CartProduct extends Product {
  vendorId: string
  vendorName: string
  vendorSlug: string
}

export interface CartItem {
  product: CartProduct
  qty: number
}

export interface VendorGroup {
  vendorId: string
  vendorName: string
  vendorSlug: string
  items: CartItem[]
  subtotal: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; product: CartProduct; qty?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; qty: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] }

const STORAGE_KEY = 'emerkato_cart_v2'

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items }
    case 'ADD': {
      const existing = state.items.find(i => i.product.id === action.product.id)
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, qty: i.qty + (action.qty ?? 1) }
              : i
          ),
        }
      }
      return { items: [...state.items, { product: action.product, qty: action.qty ?? 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.product.id !== action.productId) }
    case 'UPDATE_QTY':
      if (action.qty < 1) return { items: state.items.filter(i => i.product.id !== action.productId) }
      return {
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, qty: action.qty } : i
        ),
      }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  grandTotal: number
  addItem: (product: CartProduct, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  getCartGroupedByVendor: () => Record<string, VendorGroup>
  itemsByVendor: Record<string, VendorGroup>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'HYDRATE', items: parsed })
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // ignore storage errors (e.g. private mode quota)
    }
  }, [state.items])

  const addItem = useCallback((product: CartProduct, qty = 1) =>
    dispatch({ type: 'ADD', product, qty }), [])
  const removeItem = useCallback((productId: string) =>
    dispatch({ type: 'REMOVE', productId }), [])
  const updateQty = useCallback((productId: string, qty: number) =>
    dispatch({ type: 'UPDATE_QTY', productId, qty }), [])
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const totalItems = state.items.reduce((s, i) => s + i.qty, 0)
  const grandTotal = state.items.reduce((s, i) => s + i.product.price * i.qty, 0)

  const getCartGroupedByVendor = useCallback((): Record<string, VendorGroup> => {
    return state.items.reduce<Record<string, VendorGroup>>((acc, item) => {
      const key = item.product.vendorId || item.product.sellerId
      if (!acc[key]) {
        acc[key] = {
          vendorId: item.product.vendorId || item.product.sellerId,
          vendorName: item.product.vendorName || `Vendor ${item.product.sellerId}`,
          vendorSlug: item.product.vendorSlug || item.product.sellerId,
          items: [],
          subtotal: 0,
        }
      }
      acc[key].items.push(item)
      acc[key].subtotal += item.product.price * item.qty
      return acc
    }, {})
  }, [state.items])

  const itemsByVendor = getCartGroupedByVendor()

  return (
    <CartContext.Provider value={{
      items: state.items, totalItems, grandTotal,
      addItem, removeItem, updateQty, clearCart,
      getCartGroupedByVendor, itemsByVendor,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
