-- CampusFlora Database Migration & Security Specification
-- Version: 20260730000000_campusflora_init.sql
-- Description: Core tables, PostGIS support, CHECK constraints, Row Level Security (RLS) policies, public view, and storage bucket security rules.

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create Custom Enums & Types if needed
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) > 0),
    email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Plants Table with Strict Postgres Check Constraints
CREATE TABLE IF NOT EXISTS public.plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_name TEXT NOT NULL CHECK (char_length(trim(species_name)) BETWEEN 2 AND 150),
    common_name TEXT CHECK (char_length(common_name) <= 150),
    family TEXT CHECK (char_length(family) <= 150),
    photo_url TEXT NOT NULL CHECK (photo_url ~* '^https?://'),
    latitude NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN -90.0 AND 90.0),
    longitude NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN -180.0 AND 180.0),
    zone TEXT NOT NULL CHECK (zone IN ('North Quad', 'South Lawn', 'Botanical Garden', 'Science Complex', 'Central Park', 'East Lake')),
    verified BOOLEAN NOT NULL DEFAULT false,
    confidence_score NUMERIC(5, 2) CHECK (confidence_score BETWEEN 0.0 AND 100.0),
    notes TEXT CHECK (char_length(notes) <= 1000),
    description TEXT CHECK (char_length(description) <= 2000),
    submitted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for spatial and tag querying performance
CREATE INDEX IF NOT EXISTS idx_plants_zone ON public.plants(zone);
CREATE INDEX IF NOT EXISTS idx_plants_verified ON public.plants(verified);
CREATE INDEX IF NOT EXISTS idx_plants_species ON public.plants(species_name);
CREATE INDEX IF NOT EXISTS idx_plants_submitted_by ON public.plants(submitted_by);

-- 5. Privacy-Preserving Public View for Public Profiles & QR Codes
-- Exposes ONLY non-sensitive plant data. Omits submitter UUID, email, and user details.
CREATE OR REPLACE VIEW public.public_plants AS
SELECT 
    p.id,
    p.species_name,
    p.common_name,
    p.family,
    p.photo_url,
    p.latitude,
    p.longitude,
    p.zone,
    p.verified,
    p.confidence_score,
    p.notes,
    p.description,
    p.created_at
FROM public.plants p
WHERE p.verified = true;

-- Grant public read access to the view
GRANT SELECT ON public.public_plants TO anon, authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security Principle: Deny-by-default at database engine layer
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- POLICIES FOR: public.users
-- ----------------------------------------------------------------------------

-- Users can read their own profile row, or Admins can read all profiles
CREATE POLICY "Users read own profile or admin read all"
ON public.users
FOR SELECT
USING (
    auth.uid() = id 
    OR EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

-- Users can update their own row, BUT CANNOT change their `role` column
CREATE POLICY "Users update own profile non-role fields"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
);

-- Automatic trigger to create user row upon Supabase auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        'user' -- Default role is always 'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- POLICIES FOR: public.plants
-- ----------------------------------------------------------------------------

-- 1. SELECT: Public read for verified=true; unverified visible ONLY to submitter or admin
CREATE POLICY "Public read verified, submitter/admin read unverified"
ON public.plants
FOR SELECT
USING (
    verified = true 
    OR submitted_by = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

-- 2. INSERT: Authenticated users only, enforcing submitted_by MUST equal auth.uid()
CREATE POLICY "Authenticated user insert own plants"
ON public.plants
FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated' 
    AND submitted_by = auth.uid()
);

-- 3. UPDATE: Admin role ONLY for verification status & updates
CREATE POLICY "Admin role update plants"
ON public.plants
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

-- 4. DELETE: Admin role ONLY
CREATE POLICY "Admin role delete plants"
ON public.plants
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

-- ============================================================================
-- SUPABASE STORAGE BUCKET & RLS POLICIES
-- Bucket Name: 'plant-images'
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'plant-images', 
    'plant-images', 
    true, 
    5242880, -- 5 MB Limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Storage RLS: Public READ
CREATE POLICY "Public read plant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'plant-images');

-- Storage RLS: Authenticated upload only
CREATE POLICY "Authenticated users upload plant images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'plant-images' 
    AND auth.role() = 'authenticated'
);
