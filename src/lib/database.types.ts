// Generated from the Supabase schema (project naoh_barbershop). Regenerate after schema changes.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      admins: {
        Row: {
          added_by: string | null
          created_at: string
          email: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          email: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      barber_media: {
        Row: {
          alt: string
          barber_id: string
          created_at: string
          id: string
          kind: string
          path: string
          poster_path: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          alt?: string
          barber_id: string
          created_at?: string
          id?: string
          kind: string
          path: string
          poster_path?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          alt?: string
          barber_id?: string
          created_at?: string
          id?: string
          kind?: string
          path?: string
          poster_path?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'barber_media_barber_id_fkey'
            columns: ['barber_id']
            isOneToOne: false
            referencedRelation: 'barbers'
            referencedColumns: ['id']
          },
        ]
      }
      barbers: {
        Row: {
          bio: string
          created_at: string
          experience: string
          id: string
          is_active: boolean
          is_sample: boolean
          languages: string[]
          name: string
          phone: string
          photo_path: string | null
          role: string
          slug: string
          sort_order: number
          specialties: string[]
          telegram: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          bio?: string
          created_at?: string
          experience?: string
          id?: string
          is_active?: boolean
          is_sample?: boolean
          languages?: string[]
          name: string
          phone: string
          photo_path?: string | null
          role?: string
          slug: string
          sort_order?: number
          specialties?: string[]
          telegram?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          bio?: string
          created_at?: string
          experience?: string
          id?: string
          is_active?: boolean
          is_sample?: boolean
          languages?: string[]
          name?: string
          phone?: string
          photo_path?: string | null
          role?: string
          slug?: string
          sort_order?: number
          specialties?: string[]
          telegram?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          admin_note: string | null
          barber_id: string | null
          created_at: string
          id: string
          name: string
          note: string | null
          phone: string
          preferred_date: string | null
          preferred_time: string | null
          service_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          barber_id?: string | null
          created_at?: string
          id?: string
          name: string
          note?: string | null
          phone: string
          preferred_date?: string | null
          preferred_time?: string | null
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          barber_id?: string | null
          created_at?: string
          id?: string
          name?: string
          note?: string | null
          phone?: string
          preferred_date?: string | null
          preferred_time?: string | null
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'booking_requests_barber_id_fkey'
            columns: ['barber_id']
            isOneToOne: false
            referencedRelation: 'barbers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'booking_requests_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      gallery_items: {
        Row: {
          alt: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          path: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          alt?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          path: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          alt?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          path?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          duration_minutes: number | null
          id: string
          image_path: string | null
          is_active: boolean
          price_etb: number
          price_is_from: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          duration_minutes?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          price_etb: number
          price_is_from?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_minutes?: number | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          price_etb?: number
          price_is_from?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_settings: {
        Row: {
          address_line1: string
          address_line2: string
          facebook_url: string
          hours_days: string
          hours_time: string
          id: number
          instagram_url: string
          latitude: number | null
          longitude: number | null
          maps_place_id: string
          maps_url: string
          phone: string
          tiktok_url: string
          tripadvisor_rating: number | null
          tripadvisor_review_count: number | null
          tripadvisor_url: string
          updated_at: string
        }
        Insert: {
          address_line1?: string
          address_line2?: string
          facebook_url?: string
          hours_days?: string
          hours_time?: string
          id?: number
          instagram_url?: string
          latitude?: number | null
          longitude?: number | null
          maps_place_id?: string
          maps_url?: string
          phone: string
          tiktok_url?: string
          tripadvisor_rating?: number | null
          tripadvisor_review_count?: number | null
          tripadvisor_url?: string
          updated_at?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string
          facebook_url?: string
          hours_days?: string
          hours_time?: string
          id?: number
          instagram_url?: string
          latitude?: number | null
          longitude?: number | null
          maps_place_id?: string
          maps_url?: string
          phone?: string
          tiktok_url?: string
          tripadvisor_rating?: number | null
          tripadvisor_review_count?: number | null
          tripadvisor_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          name: string
          quote: string
          rating: number
          review_date: string
          sort_order: number
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
          quote: string
          rating?: number
          review_date?: string
          sort_order?: number
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          quote?: string
          rating?: number
          review_date?: string
          sort_order?: number
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']
