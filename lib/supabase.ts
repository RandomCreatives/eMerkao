import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co')

// Create a comprehensive mock client for development when Supabase is not configured
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Demo Mode: Supabase not configured. Please set up your environment variables to enable authentication.' } 
    }),
    signUp: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Demo Mode: Supabase not configured. Please set up your environment variables to enable user registration.' } 
    }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ 
      data: { 
        subscription: { 
          unsubscribe: () => console.log('Mock auth state change unsubscribed') 
        } 
      } 
    })
  },
  from: (table: string) => ({
    select: (columns?: string) => ({ 
      eq: (column: string, value: any) => ({ 
        single: () => Promise.resolve({ 
          data: null, 
          error: { message: `Demo Mode: Cannot fetch ${table} data. Database not configured.` } 
        }),
        order: (column: string, options?: any) => Promise.resolve({ 
          data: [], 
          error: null 
        })
      }),
      order: (column: string, options?: any) => Promise.resolve({ 
        data: [], 
        error: null 
      }),
      limit: (count: number) => Promise.resolve({ 
        data: [], 
        error: null 
      }),
      range: (from: number, to: number) => Promise.resolve({ 
        data: [], 
        error: null 
      })
    }),
    insert: (values: any) => ({ 
      select: (columns?: string) => ({ 
        single: () => Promise.resolve({ 
          data: null, 
          error: { message: `Demo Mode: Cannot insert into ${table}. Database not configured.` } 
        })
      })
    }),
    update: (values: any) => ({ 
      eq: (column: string, value: any) => ({ 
        select: (columns?: string) => ({ 
          single: () => Promise.resolve({ 
            data: null, 
            error: { message: `Demo Mode: Cannot update ${table}. Database not configured.` } 
          })
        })
      })
    }),
    delete: () => ({ 
      eq: (column: string, value: any) => Promise.resolve({ 
        error: { message: `Demo Mode: Cannot delete from ${table}. Database not configured.` } 
      })
    }),
    upsert: (values: any, options?: any) => ({ 
      select: (columns?: string) => ({ 
        single: () => Promise.resolve({ 
          data: null, 
          error: { message: `Demo Mode: Cannot upsert into ${table}. Database not configured.` } 
        })
      })
    })
  }),
  rpc: (functionName: string, params?: any) => Promise.resolve({ 
    data: null, 
    error: { message: `Demo Mode: Cannot call function ${functionName}. Database not configured.` } 
  }),
  channel: (name: string) => ({
    on: (event: string, config: any, callback: Function) => ({ 
      subscribe: () => {
        console.log(`Mock subscription to ${name} channel created`);
        return { unsubscribe: () => console.log(`Mock subscription to ${name} unsubscribed`) };
      }
    })
  })
})

// Export the appropriate client based on configuration
export const supabase = hasValidSupabaseConfig 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : createMockClient() as any

// Service role client for admin operations (server-side only)
export const supabaseAdmin = hasValidSupabaseConfig && supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createMockClient() as any

// Database helper functions
export const db = {
  // Profile operations
  async getProfile(userId: string) {
    if (!hasValidSupabaseConfig) {
      // Check for demo profile in localStorage first
      const demoProfile = localStorage.getItem('demo_user_profile');
      if (demoProfile) {
        return JSON.parse(demoProfile);
      }
      
      // Return default mock profile data
      return {
        id: userId,
        email: 'demo@emerkato.et',
        full_name: 'Demo User',
        user_type: 'buyer' as const,
        phone_number: '+251 9XX XXX XXX',
        region: 'Addis Ababa',
        is_verified: true,
        trust_score: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sellers: null
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        sellers (*)
      `)
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    if (!hasValidSupabaseConfig) {
      console.log('Demo Mode: Profile update simulated', updates);
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Product operations - return mock data in demo mode
  async getProducts(filters?: {
    category?: string
    region?: string
    cultural?: boolean
    trusted?: boolean
    search?: string
    limit?: number
    offset?: number
  }) {
    if (!hasValidSupabaseConfig) {
      // Return mock products from constants
      const { MOCK_PRODUCTS } = await import('../constants');
      let products = [...MOCK_PRODUCTS];
      
      // Apply basic filtering for demo
      if (filters?.category && filters.category !== 'All') {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters?.cultural) {
        products = products.filter(p => p.isCultural);
      }
      if (filters?.search) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      if (filters?.limit) {
        products = products.slice(0, filters.limit);
      }
      
      return products.map(p => ({
        ...p,
        categories: { name: p.category, is_cultural: p.isCultural },
        sellers: { store_name: 'Demo Store', is_trusted_seller: p.isTrusted, average_rating: p.rating },
        profiles: { full_name: 'Demo Seller', region: p.location }
      }));
    }

    let query = supabase
      .from('products')
      .select(`
        *,
        categories (name, is_cultural),
        sellers (store_name, is_trusted_seller, average_rating),
        profiles!sellers_id_fkey (full_name, region)
      `)
      .eq('status', 'active')

    if (filters?.category) {
      query = query.eq('categories.name', filters.category)
    }
    
    if (filters?.region) {
      query = query.eq('origin_region', filters.region)
    }
    
    if (filters?.cultural) {
      query = query.eq('is_cultural', true)
    }
    
    if (filters?.trusted) {
      query = query.eq('sellers.is_trusted_seller', true)
    }
    
    if (filters?.search) {
      query = query.textSearch('name', filters.search)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getProduct(productId: string) {
    if (!hasValidSupabaseConfig) {
      const { MOCK_PRODUCTS } = await import('../constants');
      const product = MOCK_PRODUCTS.find(p => p.id === productId);
      if (!product) return null;
      
      return {
        ...product,
        categories: { name: product.category, is_cultural: product.isCultural },
        sellers: { 
          store_name: 'Demo Store', 
          is_trusted_seller: product.isTrusted, 
          average_rating: product.rating,
          total_reviews: 42
        },
        profiles: { full_name: 'Demo Seller', region: product.location, avatar_url: null },
        reviews: [
          {
            id: '1',
            rating: 5,
            title: 'Excellent quality!',
            comment: 'Amazing product, highly recommended for Ethiopian culture enthusiasts.',
            created_at: new Date().toISOString(),
            profiles: { full_name: 'Happy Customer', avatar_url: null }
          }
        ]
      };
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, is_cultural),
        sellers (
          store_name, 
          is_trusted_seller, 
          average_rating,
          total_reviews
        ),
        profiles!sellers_id_fkey (full_name, region, avatar_url),
        reviews (
          id,
          rating,
          title,
          comment,
          created_at,
          profiles (full_name, avatar_url)
        )
      `)
      .eq('id', productId)
      .single()
    
    if (error) throw error
    return data
  },

  async createProduct(sellerId: string, productData: Database['public']['Tables']['products']['Insert']) {
    if (!hasValidSupabaseConfig) {
      console.log('Demo Mode: Product creation simulated', productData);
      return { ...productData, id: `demo-${Date.now()}`, seller_id: sellerId };
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        seller_id: sellerId
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Cart operations - use localStorage in demo mode
  async getCart(userId: string) {
    if (!hasValidSupabaseConfig) {
      const cartData = localStorage.getItem(`demo_cart_${userId}`) || '[]';
      return JSON.parse(cartData);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          *,
          sellers (store_name, is_trusted_seller),
          categories (name)
        )
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    if (!hasValidSupabaseConfig) {
      const cartData = JSON.parse(localStorage.getItem(`demo_cart_${userId}`) || '[]');
      const existingItem = cartData.find((item: any) => item.product_id === productId);
      
      if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        cartData.push({
          id: `demo-${Date.now()}`,
          user_id: userId,
          product_id: productId,
          quantity,
          created_at: new Date().toISOString()
        });
      }
      
      localStorage.setItem(`demo_cart_${userId}`, JSON.stringify(cartData));
      return cartData[cartData.length - 1];
    }

    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        product_id: productId,
        quantity
      }, {
        onConflict: 'user_id,product_id'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async removeFromCart(userId: string, productId: string) {
    if (!hasValidSupabaseConfig) {
      const cartData = JSON.parse(localStorage.getItem(`demo_cart_${userId}`) || '[]');
      const filteredCart = cartData.filter((item: any) => item.product_id !== productId);
      localStorage.setItem(`demo_cart_${userId}`, JSON.stringify(filteredCart));
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
    
    if (error) throw error
  },

  // Mock implementations for other methods
  async createOrder(orderData: any, items: any[]) {
    if (!hasValidSupabaseConfig) {
      console.log('Demo Mode: Order creation simulated', { orderData, items });
      return { order: { ...orderData, id: `demo-order-${Date.now()}` }, items };
    }
    // Real implementation would go here
    throw new Error('Order creation not implemented yet');
  },

  async getUserOrders(userId: string) {
    if (!hasValidSupabaseConfig) {
      return []; // Return empty orders for demo
    }
    // Real implementation would go here
    return [];
  },

  async syncTelegramUser(userId: string, telegramData: any) {
    if (!hasValidSupabaseConfig) {
      console.log('Demo Mode: Telegram sync simulated', telegramData);
      return null;
    }
    // Real implementation would go here
    return null;
  },

  async saveTelegramMessage(conversationId: string, messageData: any) {
    if (!hasValidSupabaseConfig) {
      console.log('Demo Mode: Telegram message save simulated', messageData);
      return null;
    }
    // Real implementation would go here
    return null;
  },

  async getTelegramConversation(telegramChatId: number, telegramUserId: number) {
    if (!hasValidSupabaseConfig) {
      return null;
    }
    // Real implementation would go here
    return null;
  },

  async getTelegramMessages(conversationId: string, limit: number = 50) {
    if (!hasValidSupabaseConfig) {
      return [];
    }
    // Real implementation would go here
    return [];
  },

  async trackProductView(productId: string, source: string = 'direct') {
    if (!hasValidSupabaseConfig) {
      console.log('Demo Mode: Product view tracked', { productId, source });
      return;
    }
    // Real implementation would go here
  },

  async getSellerAnalytics(sellerId: string, days: number = 30) {
    if (!hasValidSupabaseConfig) {
      // Return mock analytics data
      return Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 100) + 20,
        clicks: Math.floor(Math.random() * 50) + 5,
        cart_additions: Math.floor(Math.random() * 20) + 2,
        purchases: Math.floor(Math.random() * 10) + 1,
        revenue: Math.floor(Math.random() * 5000) + 500,
        products: { name: 'Demo Product' }
      }));
    }
    // Real implementation would go here
    return [];
  }
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToOrders(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `buyer_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  subscribeToProducts(sellerId: string, callback: (payload: any) => void) {
    return supabase
      .channel('products')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `seller_id=eq.${sellerId}`
      }, callback)
      .subscribe()
  },

  subscribeToTelegramMessages(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel('telegram_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'telegram_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe()
  }
}