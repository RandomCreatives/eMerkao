export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          is_cultural: boolean
          name: string
          name_am: string | null
          name_om: string | null
          name_ti: string | null
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_cultural?: boolean
          name: string
          name_am?: string | null
          name_om?: string | null
          name_ti?: string | null
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_cultural?: boolean
          name?: string
          name_am?: string | null
          name_om?: string | null
          name_ti?: string | null
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json
          id: string
          is_read: boolean
          is_sent: boolean
          message: string
          read_at: string | null
          send_email: boolean
          send_push: boolean
          send_sms: boolean
          send_telegram: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          is_sent?: boolean
          message: string
          read_at?: string | null
          send_email?: boolean
          send_push?: boolean
          send_sms?: boolean
          send_telegram?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          is_sent?: boolean
          message?: string
          read_at?: string | null
          send_email?: boolean
          send_push?: boolean
          send_sms?: boolean
          send_telegram?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_image_url: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          seller_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_image_url?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          seller_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_image_url?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          seller_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          billing_address: Json | null
          buyer_id: string
          created_at: string
          discount_amount: number
          estimated_delivery_date: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_number: string
          payment_gateway_response: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping_address: Json
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount: number
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          billing_address?: Json | null
          buyer_id: string
          created_at?: string
          discount_amount?: number
          estimated_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number: string
          payment_gateway_response?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address: Json
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount?: number
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          billing_address?: Json | null
          buyer_id?: string
          created_at?: string
          discount_amount?: number
          estimated_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: string
          payment_gateway_response?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: Json
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      product_analytics: {
        Row: {
          cart_additions: number
          clicks: number
          created_at: string
          date: string
          direct_views: number
          id: string
          organic_views: number
          product_id: string
          purchases: number
          revenue: number
          search_views: number
          social_views: number
          views: number
        }
        Insert: {
          cart_additions?: number
          clicks?: number
          created_at?: string
          date: string
          direct_views?: number
          id?: string
          organic_views?: number
          product_id: string
          purchases?: number
          revenue?: number
          search_views?: number
          social_views?: number
          views?: number
        }
        Update: {
          cart_additions?: number
          clicks?: number
          created_at?: string
          date?: string
          direct_views?: number
          id?: string
          organic_views?: number
          product_id?: string
          purchases?: number
          revenue?: number
          search_views?: number
          social_views?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          category_id: string
          color: string | null
          created_at: string
          currency: string
          description: string | null
          dimensions: Json | null
          favorite_count: number
          id: string
          images: Json
          is_cultural: boolean
          is_featured: boolean
          material: string | null
          meta_description: string | null
          meta_title: string | null
          min_stock_level: number
          name: string
          origin_city: string | null
          origin_region: string | null
          original_price: number | null
          price: number
          seller_id: string
          short_description: string | null
          size: string | null
          sku: string | null
          slug: string | null
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number
          synced_from_telegram: boolean
          tags: string[] | null
          telegram_chat_id: number | null
          telegram_message_id: number | null
          updated_at: string
          video_url: string | null
          view_count: number
          weight: number | null
        }
        Insert: {
          category_id: string
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          dimensions?: Json | null
          favorite_count?: number
          id?: string
          images?: Json
          is_cultural?: boolean
          is_featured?: boolean
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          min_stock_level?: number
          name: string
          origin_city?: string | null
          origin_region?: string | null
          original_price?: number | null
          price: number
          seller_id: string
          short_description?: string | null
          size?: string | null
          sku?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          synced_from_telegram?: boolean
          tags?: string[] | null
          telegram_chat_id?: number | null
          telegram_message_id?: number | null
          updated_at?: string
          video_url?: string | null
          view_count?: number
          weight?: number | null
        }
        Update: {
          category_id?: string
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          dimensions?: Json | null
          favorite_count?: number
          id?: string
          images?: Json
          is_cultural?: boolean
          is_featured?: boolean
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          min_stock_level?: number
          name?: string
          origin_city?: string | null
          origin_region?: string | null
          original_price?: number | null
          price?: number
          seller_id?: string
          short_description?: string | null
          size?: string | null
          sku?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          synced_from_telegram?: boolean
          tags?: string[] | null
          telegram_chat_id?: number | null
          telegram_message_id?: number | null
          updated_at?: string
          video_url?: string | null
          view_count?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          gender: string | null
          house_number: string | null
          id: string
          is_verified: boolean
          kebele: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_active_at: string
          phone_number: string | null
          preferred_language: string
          region: string | null
          subcity: string | null
          telegram_chat_id: number | null
          telegram_user_id: number | null
          telegram_username: string | null
          trust_score: number
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          woreda: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          gender?: string | null
          house_number?: string | null
          id: string
          is_verified?: boolean
          kebele?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_active_at?: string
          phone_number?: string | null
          preferred_language?: string
          region?: string | null
          subcity?: string | null
          telegram_chat_id?: number | null
          telegram_user_id?: number | null
          telegram_username?: string | null
          trust_score?: number
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          woreda?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          house_number?: string | null
          id?: string
          is_verified?: boolean
          kebele?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_active_at?: string
          phone_number?: string | null
          preferred_language?: string
          region?: string | null
          subcity?: string | null
          telegram_chat_id?: number | null
          telegram_user_id?: number | null
          telegram_username?: string | null
          trust_score?: number
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          woreda?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string
          helpful_count: number
          id: string
          images: Json
          is_approved: boolean
          is_verified: boolean
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          images?: Json
          is_approved?: boolean
          is_verified?: boolean
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          images?: Json
          is_approved?: boolean
          is_verified?: boolean
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      seller_integrations: {
        Row: {
          access_token: string | null
          configuration: Json
          created_at: string
          error_message: string | null
          expires_at: string | null
          id: string
          is_enabled: boolean
          last_sync_at: string | null
          platform: Database["public"]["Enums"]["integration_platform"]
          refresh_token: string | null
          seller_id: string
          sync_status: string
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          configuration?: Json
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          platform: Database["public"]["Enums"]["integration_platform"]
          refresh_token?: string | null
          seller_id: string
          sync_status?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          configuration?: Json
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          platform?: Database["public"]["Enums"]["integration_platform"]
          refresh_token?: string | null
          seller_id?: string
          sync_status?: string
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_integrations_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          }
        ]
      }
      sellers: {
        Row: {
          available_balance: number
          average_rating: number
          business_license_number: string | null
          commission_rate: number
          created_at: string
          facebook_enabled: boolean
          id: string
          instagram_enabled: boolean
          is_trusted_seller: boolean
          n8n_webhook_url: string | null
          pending_balance: number
          store_description: string | null
          store_logo_url: string | null
          store_name: string
          tax_identification_number: string | null
          telegram_bot_enabled: boolean
          total_orders: number
          total_reviews: number
          total_sales: number
          updated_at: string
          verification_documents: Json | null
        }
        Insert: {
          available_balance?: number
          average_rating?: number
          business_license_number?: string | null
          commission_rate?: number
          created_at?: string
          facebook_enabled?: boolean
          id: string
          instagram_enabled?: boolean
          is_trusted_seller?: boolean
          n8n_webhook_url?: string | null
          pending_balance?: number
          store_description?: string | null
          store_logo_url?: string | null
          store_name: string
          tax_identification_number?: string | null
          telegram_bot_enabled?: boolean
          total_orders?: number
          total_reviews?: number
          total_sales?: number
          updated_at?: string
          verification_documents?: Json | null
        }
        Update: {
          available_balance?: number
          average_rating?: number
          business_license_number?: string | null
          commission_rate?: number
          created_at?: string
          facebook_enabled?: boolean
          id?: string
          instagram_enabled?: boolean
          is_trusted_seller?: boolean
          n8n_webhook_url?: string | null
          pending_balance?: number
          store_description?: string | null
          store_logo_url?: string | null
          store_name?: string
          tax_identification_number?: string | null
          telegram_bot_enabled?: boolean
          total_orders?: number
          total_reviews?: number
          total_sales?: number
          updated_at?: string
          verification_documents?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sellers_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      telegram_conversations: {
        Row: {
          context_data: Json
          created_at: string
          current_state: string
          id: string
          language_preference: string
          notifications_enabled: boolean
          telegram_chat_id: number
          telegram_user_id: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          context_data?: Json
          created_at?: string
          current_state?: string
          id?: string
          language_preference?: string
          notifications_enabled?: boolean
          telegram_chat_id: number
          telegram_user_id: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          context_data?: Json
          created_at?: string
          current_state?: string
          id?: string
          language_preference?: string
          notifications_enabled?: boolean
          telegram_chat_id?: number
          telegram_user_id?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_conversations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      telegram_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          created_product_id: string | null
          extracted_product_data: Json | null
          id: string
          is_processed: boolean
          media_urls: Json
          message_type: Database["public"]["Enums"]["message_type"]
          processing_result: Json | null
          telegram_chat_id: number
          telegram_message_id: number
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          created_product_id?: string | null
          extracted_product_data?: Json | null
          id?: string
          is_processed?: boolean
          media_urls?: Json
          message_type: Database["public"]["Enums"]["message_type"]
          processing_result?: Json | null
          telegram_chat_id: number
          telegram_message_id: number
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          created_product_id?: string | null
          extracted_product_data?: Json | null
          id?: string
          is_processed?: boolean
          media_urls?: Json
          message_type?: Database["public"]["Enums"]["message_type"]
          processing_result?: Json | null
          telegram_chat_id?: number
          telegram_message_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "telegram_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "telegram_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_messages_created_product_id_fkey"
            columns: ["created_product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_seller_profile: {
        Args: {
          user_uuid: string
          store_name_param: string
          store_description_param?: string
        }
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_product_recommendations: {
        Args: {
          user_uuid: string
          limit_count?: number
        }
        Returns: {
          product_id: string
          product_name: string
          price: number
          category_name: string
          is_cultural: boolean
          recommendation_score: number
          reason: string
        }[]
      }
      get_trending_products_by_region: {
        Args: {
          region_name?: string
          limit_count?: number
        }
        Returns: {
          product_id: string
          product_name: string
          price: number
          seller_name: string
          category_name: string
          is_cultural: boolean
          total_views: number
          trend_score: number
        }[]
      }
      get_user_profile: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          email: string
          full_name: string
          user_type: Database["public"]["Enums"]["user_type"]
          is_verified: boolean
          trust_score: number
          telegram_user_id: number
        }[]
      }
      refresh_popular_products: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_telegram_user: {
        Args: {
          user_uuid: string
          tg_user_id: number
          tg_username?: string
          tg_chat_id?: number
        }
        Returns: string
      }
      update_seller_metrics: {
        Args: {
          seller_uuid: string
        }
        Returns: undefined
      }
    }
    Enums: {
      integration_platform: "facebook" | "instagram" | "telegram" | "whatsapp"
      kyc_status: "unverified" | "pending" | "verified" | "rejected"
      message_type: "user" | "bot" | "system"
      order_status:
        | "pending"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_method:
        | "telebirr"
        | "cbe_birr"
        | "cash_on_delivery"
        | "bank_transfer"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      product_status: "active" | "inactive" | "out_of_stock" | "pending_approval"
      user_type: "buyer" | "seller" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}