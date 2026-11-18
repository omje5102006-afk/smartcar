-- ==============================================================================
-- SMART USED CAR DEALER MANAGEMENT SYSTEM WITH AI CHATBOT
-- PostgreSQL Database Schema & Row-Level Security (RLS) Policies for Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'dealer', 'sales', 'customer');
CREATE TYPE car_status AS ENUM ('available', 'reserved', 'sold');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'cng');
CREATE TYPE transmission_type AS ENUM ('automatic', 'manual');
CREATE TYPE lead_source AS ENUM ('chatbot', 'web_form', 'walk_in', 'phone');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'test_drive_booked', 'closed', 'lost');

-- 3. PROFILES TABLE (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CARS (INVENTORY) TABLE
CREATE TABLE IF NOT EXISTS public.cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make TEXT NOT NULL,                         -- e.g. 'Honda', 'Hyundai', 'Tata'
    model TEXT NOT NULL,                        -- e.g. 'City ZX', 'Creta SX', 'Nexon EV'
    year INTEGER NOT NULL CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0), -- Stored in base currency (e.g. INR / USD)
    mileage INTEGER NOT NULL CHECK (mileage >= 0),   -- In KM
    fuel_type fuel_type NOT NULL,
    transmission transmission_type NOT NULL,
    condition TEXT NOT NULL DEFAULT 'Excellent',    -- 'Certified Pre-Owned', 'Excellent', etc.
    color TEXT,
    owners INTEGER DEFAULT 1,
    description TEXT,
    features TEXT[] DEFAULT '{}',                   -- ['Sunroof', '360 Camera', 'Cruise Control']
    images TEXT[] NOT NULL DEFAULT '{}',            -- Array of Supabase Storage or CDN URLs
    status car_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. LEADS & CRM TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    message TEXT,
    preferred_date DATE,
    source lead_source NOT NULL DEFAULT 'chatbot',
    status lead_status NOT NULL DEFAULT 'new',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_cars_status ON public.cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON public.cars(make, model);
CREATE INDEX IF NOT EXISTS idx_cars_price ON public.cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_year ON public.cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON public.cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_leads_car_id ON public.leads(car_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- ==============================================================================
-- 7. HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cars_modtime
    BEFORE UPDATE ON public.cars
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_leads_modtime
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Helper function to check if current user is an Admin/Staff
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('admin', 'dealer', 'sales')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile entry when a new auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 8.1 PROFILES POLICIES
-- Anyone authenticated can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Admins can view and manage all profiles
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- 8.2 CARS POLICIES
-- Public & unauthenticated visitors can view available or reserved cars
CREATE POLICY "Public can view available cars"
    ON public.cars FOR SELECT
    TO anon, authenticated
    USING (status IN ('available', 'reserved') OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

-- Admin/Staff can insert new cars
CREATE POLICY "Admins can insert cars"
    ON public.cars FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- Admin/Staff can update cars
CREATE POLICY "Admins can update cars"
    ON public.cars FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admin/Staff can delete cars
CREATE POLICY "Admins can delete cars"
    ON public.cars FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- 8.3 LEADS POLICIES
-- Anyone (including anon visitors & chatbot) can insert a new lead
CREATE POLICY "Anyone can submit a lead"
    ON public.leads FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only Admin & Sales staff can read and manage leads
CREATE POLICY "Admins can view all leads"
    ON public.leads FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update leads"
    ON public.leads FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete leads"
    ON public.leads FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- ==============================================================================
-- 10. EMPLOYEE ATTENDANCE & STAFF MANAGEMENT TABLE
-- ==============================================================================
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'half_day', 'absent', 'on_leave');

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    role TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TEXT,
    check_out TEXT,
    status attendance_status NOT NULL DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view and manage staff attendance"
    ON public.attendance FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()));

