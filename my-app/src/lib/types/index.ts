// ── Enums (mirror your Supabase enums) ────────────
export type UserRole = 'farmer' | 'retailer' | 'admin' | 'logistics'
export type ListingStatus = 'open' | 'pool_active' | 'fulfilled' | 'cancelled'
export type PoolStatus = 'open' | 'closed' | 'dispatched' | 'completed'
export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded'
 
// ── Database row types ─────────────────────────────
export interface User {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  district: string | null
  verified_at: string | null
  created_at: string
}
 
export interface Farm {
  id: string
  owner_id: string
  name: string
  location_lat: number | null
  location_lng: number | null
  district: string
  crop_types: string[]
  created_at: string
}
 
export interface HarvestListing {
  id: string
  farm_id: string
  crop_name: string
  quantity_kg: number
  base_price_lkr: number
  moq_kg: number
  available_from: string
  available_until: string
  description: string | null
  status: ListingStatus
  created_at: string
}
 
// ── Form input types ───────────────────────────────
export interface RegisterFormData {
  full_name: string
  email: string
  password: string
  role: UserRole
  phone: string
  district: string
}
 
export interface ListingFormData {
  crop_name: string
  quantity_kg: number
  base_price_lkr: number
  moq_kg: number
  available_from: string
  available_until: string
  description?: string
}