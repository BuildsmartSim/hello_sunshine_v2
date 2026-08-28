-- Security Hardening Migration: Row Level Security (RLS) Enforcement
-- Date: 2026-08-06

-- 1. Enable RLS on core tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.discovery_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 2. Profiles: Users can view & update their own profile; Admins can view/manage all
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view and manage all profiles" ON public.profiles;
CREATE POLICY "Admins can view and manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 3. Tickets: Users can view their assigned tickets; Admins can view/manage all
DROP POLICY IF EXISTS "Users can view assigned tickets" ON public.tickets;
CREATE POLICY "Users can view assigned tickets" ON public.tickets
    FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.tickets;
CREATE POLICY "Admins can manage all tickets" ON public.tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'clerk')
        )
    );

-- 4. Products, Slots, Locations: Public read-only for catalog, write for admins
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Public can view slots" ON public.slots;
CREATE POLICY "Public can view slots" ON public.slots
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view locations" ON public.locations;
CREATE POLICY "Public can view locations" ON public.locations
    FOR SELECT USING (true);
