import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  user_type: "tenant" | "landlord" | "admin"
  profile_image_url?: string
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  landlord_id: string
  title: string
  description?: string
  property_type: string
  address: string
  city: string
  state?: string
  postal_code?: string
  country: string
  latitude?: number
  longitude?: number
  bedrooms: number
  bathrooms: number
  square_feet?: number
  rent_amount: number
  security_deposit?: number
  lease_duration?: number
  available_from?: string
  is_furnished: boolean
  pets_allowed: boolean
  smoking_allowed: boolean
  utilities_included?: string[]
  amenities?: string[]
  images?: string[]
  status: "pending" | "approved" | "rejected" | "rented" | "inactive"
  featured: boolean
  views_count: number
  created_at: string
  updated_at: string
  landlord?: User
  ratings?: {
    average: number
    count: number
  }
}
