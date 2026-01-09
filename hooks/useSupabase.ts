import { useState, useEffect } from 'react'
import { supabase, db } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { Database } from '../lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Order = Database['public']['Tables']['orders']['Row']

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        try {
          const profileData = await db.getProfile(session.user.id)
          setProfile(profileData)
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const profileData = await db.getProfile(session.user.id)
            setProfile(profileData)
          } catch (error) {
            console.error('Error fetching profile:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    user_type?: 'buyer' | 'seller'
    phone_number?: string
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')
    
    const updatedProfile = await db.updateProfile(user.id, updates)
    setProfile(updatedProfile)
    return updatedProfile
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }
}

// Products hook
export function useProducts(filters?: {
  category?: string
  region?: string
  cultural?: boolean
  trusted?: boolean
  search?: string
  limit?: number
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await db.getProducts(filters)
        setProducts(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [JSON.stringify(filters)])

  return { products, loading, error, refetch: () => setLoading(true) }
}

// Single product hook
export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) {
      setProduct(null)
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await db.getProduct(productId)
        setProduct(data)
        
        // Track view
        await db.trackProductView(productId)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  return { product, loading, error }
}

// Cart hook
export function useCart() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setCartItems([])
      return
    }

    const fetchCart = async () => {
      try {
        setLoading(true)
        const data = await db.getCart(user.id)
        setCartItems(data)
      } catch (error) {
        console.error('Error fetching cart:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [user])

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) throw new Error('Must be logged in to add to cart')
    
    await db.addToCart(user.id, productId, quantity)
    
    // Refresh cart
    const data = await db.getCart(user.id)
    setCartItems(data)
  }

  const removeFromCart = async (productId: string) => {
    if (!user) throw new Error('Must be logged in')
    
    await db.removeFromCart(user.id, productId)
    
    // Refresh cart
    const data = await db.getCart(user.id)
    setCartItems(data)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity)
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    getTotalPrice,
    getTotalItems
  }
}

// Orders hook
export function useOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setOrders([])
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await db.getUserOrders(user.id)
        setOrders(data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  return { orders, loading }
}

// Seller analytics hook
export function useSellerAnalytics(days: number = 30) {
  const { user, profile } = useAuth()
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || profile?.user_type !== 'seller') {
      setAnalytics([])
      return
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = await db.getSellerAnalytics(user.id, days)
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user, profile, days])

  return { analytics, loading }
}

// Telegram integration hook
export function useTelegramIntegration() {
  const { user, profile } = useAuth()
  const [isLinked, setIsLinked] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<any[]>([])

  useEffect(() => {
    setIsLinked(!!(profile?.telegram_user_id))
  }, [profile])

  const linkTelegramAccount = async (telegramData: {
    telegram_user_id: number
    telegram_username?: string
    telegram_chat_id?: number
  }) => {
    if (!user) throw new Error('Must be logged in')
    
    await db.syncTelegramUser(user.id, telegramData)
    
    // Update profile state
    const updatedProfile = await db.getProfile(user.id)
    // This would need to be connected to the auth hook's setProfile
    
    setIsLinked(true)
  }

  const getConversationHistory = async () => {
    if (!user || !profile?.telegram_chat_id || !profile?.telegram_user_id) {
      return []
    }

    try {
      const telegramService = await import('../services/telegramService')
      const history = await telegramService.telegramService.getConversationHistory(
        profile.telegram_chat_id,
        profile.telegram_user_id
      )
      setConversationHistory(history)
      return history
    } catch (error) {
      console.error('Error fetching conversation history:', error)
      return []
    }
  }

  return {
    isLinked,
    conversationHistory,
    linkTelegramAccount,
    getConversationHistory
  }
}