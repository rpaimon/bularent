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
  created_at?: string
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
  properties?: Pick<Property, "id" | "title" | "status" | "images" | "owner_id"> | null
}

export interface Conversation {
  id: string
  property_id: string
  renter_id: string
  owner_id: string
  last_message_at: string
  created_at: string
  properties?: Pick<Property, "id" | "title" | "images"> | null
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  read_at: string | null
  created_at: string
}

export interface PlatformSettings {
  allow_submissions: boolean
  announcement: string
  support_email: string
}
