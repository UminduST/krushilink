-- KrushiLink core marketplace tables
-- Run in Supabase Dashboard → SQL Editor after the users migration

-- Enums
DO $$ BEGIN
  CREATE TYPE public.listing_status AS ENUM ('open', 'pool_active', 'fulfilled', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pool_status AS ENUM ('open', 'closed', 'dispatched', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'held', 'released', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Farms
CREATE TABLE IF NOT EXISTS public.farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Farm',
  location_lat double precision,
  location_lng double precision,
  district text NOT NULL DEFAULT 'Colombo',
  crop_types text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS farms_owner_id_idx ON public.farms (owner_id);

-- Harvest listings
CREATE TABLE IF NOT EXISTS public.harvest_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  quantity_kg numeric NOT NULL CHECK (quantity_kg > 0),
  base_price_lkr numeric NOT NULL CHECK (base_price_lkr > 0),
  moq_kg numeric NOT NULL CHECK (moq_kg > 0),
  available_from date NOT NULL,
  available_until date NOT NULL,
  description text,
  status public.listing_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (available_until >= available_from),
  CHECK (moq_kg <= quantity_kg)
);

CREATE INDEX IF NOT EXISTS harvest_listings_farm_id_idx ON public.harvest_listings (farm_id);
CREATE INDEX IF NOT EXISTS harvest_listings_status_idx ON public.harvest_listings (status);

-- Demand pools
CREATE TABLE IF NOT EXISTS public.demand_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.harvest_listings (id) ON DELETE CASCADE,
  district text NOT NULL,
  closes_at timestamptz NOT NULL,
  total_committed_kg numeric NOT NULL DEFAULT 0,
  moq_kg numeric NOT NULL,
  status public.pool_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demand_pools_listing_id_idx ON public.demand_pools (listing_id);

-- Pool orders (retailer commitments)
CREATE TABLE IF NOT EXISTS public.pool_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES public.demand_pools (id) ON DELETE CASCADE,
  retailer_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  quantity_kg numeric NOT NULL CHECK (quantity_kg > 0),
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  payment_status public.payment_status NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS pool_orders_pool_id_idx ON public.pool_orders (pool_id);
CREATE INDEX IF NOT EXISTS pool_orders_retailer_id_idx ON public.pool_orders (retailer_id);

-- RLS
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_orders ENABLE ROW LEVEL SECURITY;

-- Farms policies
DROP POLICY IF EXISTS "Farmers manage own farms" ON public.farms;
CREATE POLICY "Farmers manage own farms"
  ON public.farms FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can view farms" ON public.farms;
CREATE POLICY "Anyone can view farms"
  ON public.farms FOR SELECT TO authenticated
  USING (true);

-- Listings policies
DROP POLICY IF EXISTS "Farmers manage own listings" ON public.harvest_listings;
CREATE POLICY "Farmers manage own listings"
  ON public.harvest_listings FOR ALL TO authenticated
  USING (
    farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users view listings" ON public.harvest_listings;
CREATE POLICY "Authenticated users view listings"
  ON public.harvest_listings FOR SELECT TO authenticated
  USING (true);

-- Pools: farmers see pools for their listings; retailers see open pools
DROP POLICY IF EXISTS "View demand pools" ON public.demand_pools;
CREATE POLICY "View demand pools"
  ON public.demand_pools FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Farmers create pools for own listings" ON public.demand_pools;
CREATE POLICY "Farmers create pools for own listings"
  ON public.demand_pools FOR INSERT TO authenticated
  WITH CHECK (
    listing_id IN (
      SELECT hl.id FROM public.harvest_listings hl
      JOIN public.farms f ON f.id = hl.farm_id
      WHERE f.owner_id = auth.uid()
    )
  );

-- Pool orders
DROP POLICY IF EXISTS "Retailers manage own pool orders" ON public.pool_orders;
CREATE POLICY "Retailers manage own pool orders"
  ON public.pool_orders FOR ALL TO authenticated
  USING (retailer_id = auth.uid())
  WITH CHECK (retailer_id = auth.uid());

DROP POLICY IF EXISTS "Farmers view orders on their pools" ON public.pool_orders;
CREATE POLICY "Farmers view orders on their pools"
  ON public.pool_orders FOR SELECT TO authenticated
  USING (
    pool_id IN (
      SELECT dp.id FROM public.demand_pools dp
      JOIN public.harvest_listings hl ON hl.id = dp.listing_id
      JOIN public.farms f ON f.id = hl.farm_id
      WHERE f.owner_id = auth.uid()
    )
  );

-- Auto-create demand pool when a listing is published
CREATE OR REPLACE FUNCTION public.create_pool_for_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  farm_district text;
BEGIN
  SELECT district INTO farm_district FROM public.farms WHERE id = NEW.farm_id;

  INSERT INTO public.demand_pools (listing_id, district, closes_at, moq_kg)
  VALUES (
    NEW.id,
    coalesce(farm_district, 'Colombo'),
    (NEW.available_from::timestamptz - interval '24 hours'),
    NEW.moq_kg
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_listing_created ON public.harvest_listings;
CREATE TRIGGER on_listing_created
  AFTER INSERT ON public.harvest_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_pool_for_listing();
