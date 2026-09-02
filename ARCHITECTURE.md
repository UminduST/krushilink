# KrushiLink — Architecture Document
Last updated: May 2025 | Version 1.0

## What is KrushiLink?
A B2B SaaS marketplace connecting Sri Lankan farmers directly
with retailers, supermarkets, and restaurants — eliminating
middlemen and reducing post-harvest food waste.

## How It Works
1. Farmer lists a crop 3-5 days before harvest
   (e.g. 500kg leeks, available Friday, 250 LKR/kg)
2. Retailers browse and join a Demand Pool for that listing
3. Pool closes automatically when MOQ is met
4. System generates a logistics manifest for delivery
5. Retailer pays into escrow -> farmer delivers -> payment released

## Four User Roles
farmer    -> lists crops, receives SMS, confirms orders
retailer  -> browses listings, joins pools, pays, receives delivery
admin     -> manages platform, resolves disputes, monitors revenue
logistics -> receives manifests, confirms deliveries

## Pages
/login /register                -> public auth pages
/farmer/dashboard /listings /listings/new /orders /earnings /profile
/retailer/dashboard /browse /pools /pools/[id] /orders /profile
/admin/dashboard /users /listings /pools /transactions /disputes
/logistics/manifests /manifests/[id] /history

## Database Tables

### users
id, role ('farmer'|'retailer'|'admin'|'logistics'),
full_name, phone (+94 format), district, verified_at, created_at

### farms
id, owner_id (-> users), name,
location_lat, location_lng, district, crop_types[]

### harvest_listings
id, farm_id (-> farms), crop_name, quantity_kg,
base_price_lkr (per kg), available_from (date), available_until (date),
moq_kg, status ('open'|'pool_active'|'fulfilled'|'cancelled'), created_at

### demand_pools
id, listing_id (-> harvest_listings), district,
closes_at (listing.available_from - 24hr),
total_committed_kg, moq_kg,
status ('open'|'closed'|'dispatched'|'completed')

### pool_orders
id, pool_id (-> demand_pools), retailer_id (-> users),
quantity_kg, confirmed_at,
payment_status ('pending'|'held'|'released'|'refunded')

### deliveries
id, pool_id (-> demand_pools), logistics_provider_id (-> users),
route_manifest (JSONB), scheduled_at, completed_at, proof_of_delivery_url

### transactions
id, pool_order_id (-> pool_orders), amount_lkr,
platform_fee_lkr (2-5 LKR per kg), payout_status ('pending'|'processing'|'paid'),
payout_at, payhere_reference

### notifications
id, user_id (-> users), channel ('sms'|'push'|'email'),
message, sent_at, read_at

## API Routes
GET    /api/listings              -> all open listings
POST   /api/listings              -> create listing (farmer)
GET    /api/listings/[id]         -> single listing
PATCH  /api/listings/[id]         -> update listing (farmer/owner)
DELETE /api/listings/[id]         -> cancel listing (farmer/owner)
GET    /api/pools                 -> pools for listing or district
POST   /api/pools                 -> create pool
POST   /api/pools/[id]/join       -> retailer joins pool
POST   /api/pools/[id]/close      -> close pool + trigger logistics
POST   /api/payments/initiate     -> start PayHere payment
POST   /api/webhooks/payhere      -> PayHere callback
POST   /api/payments/release/[id] -> release escrow (admin)
GET    /api/manifests/[poolId]    -> delivery manifest
POST   /api/manifests/[poolId]/confirm -> logistics confirms delivery
POST   /api/sms/send              -> internal SMS sender
GET    /api/notifications         -> user notification history

## Supabase Clients
src/lib/supabase/client.ts -> browser client (Client Components only)
src/lib/supabase/server.ts -> server client (API routes + Server Components)
NEVER use browser client in API routes.

## Environment Variables
NEXT_PUBLIC_SUPABASE_URL          -> Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     -> Supabase anon key (safe for browser)
SUPABASE_SERVICE_ROLE_KEY         -> admin DB key (server only, never expose)
PAYHERE_MERCHANT_ID               -> PayHere credentials
PAYHERE_SECRET                    -> PayHere secret
DIALOG_SMS_API_KEY                -> Dialog Axiata SMS
GOOGLE_MAPS_API_KEY               -> Route optimization

## Critical Business Rules
- Pool closes automatically when total_committed_kg >= moq_kg
- On pool close: SMS farmer, call Google Maps API, create delivery row
- Payment held in escrow until logistics confirms delivery
- Farmers notified via SMS only (many have basic phones, not smartphones)
- Platform fee = 2-5 LKR per kg, deducted at payout time
- Never expose SUPABASE_SERVICE_ROLE_KEY to the client
- Always validate all inputs with Zod before any database write
- Check user role server-side before every data mutation