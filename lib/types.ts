export type UserRole = "tenant" | "landlord" | "agent" | "admin"
export type ListingStatus = "draft" | "pending_review" | "approved" | "rejected" | "rented" | "archived"

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  verified: boolean
  banned: boolean
}

export interface Property {
  id: string
  owner_id: string
  title: string
  description: string
  property_type: string
  address: string
  city: string
  bedrooms: number
  bathrooms: number
  rent_amount: number
  available_from: string | null
  furnished: boolean
  amenities: string[]
  images: string[]
  contact_phone: string
  whatsapp_phone: string | null
  status: ListingStatus
  featured: boolean
  verified: boolean
  rejection_reason: string | null
  created_at: string
  profiles?: Pick<Profile, "full_name" | "verified"> | null
}

export interface Report {
  id: string
  property_id: string
  reporter_id: string
  reason: string
  details: string | null
  status: "open" | "reviewing" | "resolved" | "dismissed"
  created_at: string
  properties?: Pick<Property, "title"> | null
}
