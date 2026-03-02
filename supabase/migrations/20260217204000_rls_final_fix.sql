-- Complete RLS fix with SECURITY DEFINER function
-- Step 1: Disable RLS temporarily
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE offerings DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "orgs_select" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
DROP POLICY IF EXISTS "user_orgs_select" ON user_organizations;
DROP POLICY IF EXISTS "user_orgs_insert" ON user_organizations;
DROP POLICY IF EXISTS "locations_select" ON locations;
DROP POLICY IF EXISTS "locations_insert" ON locations;
DROP POLICY IF EXISTS "locations_update" ON locations;
DROP POLICY IF EXISTS "locations_delete" ON locations;
DROP POLICY IF EXISTS "offerings_select" ON offerings;
DROP POLICY IF EXISTS "offerings_insert" ON offerings;
DROP POLICY IF EXISTS "offerings_update" ON offerings;
DROP POLICY IF EXISTS "offerings_delete" ON offerings;
DROP POLICY IF EXISTS "resources_select" ON resources;
DROP POLICY IF EXISTS "resources_insert" ON resources;
DROP POLICY IF EXISTS "resources_update" ON resources;
DROP POLICY IF EXISTS "resources_delete" ON resources;
DROP POLICY IF EXISTS "bookings_select" ON bookings;
DROP POLICY IF EXISTS "bookings_insert" ON bookings;
DROP POLICY IF EXISTS "bookings_update" ON bookings;
DROP POLICY IF EXISTS "bookings_delete" ON bookings;
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;

-- Step 3: Create helper function with BYPASSRLS (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.current_user_organization_ids()
RETURNS UUID[] AS $$
  SELECT ARRAY(
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.current_user_organization_ids() TO authenticated;

-- Step 4: Enable RLS and create simple policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations: user can see orgs they belong to
CREATE POLICY "orgs_select" ON organizations
  FOR SELECT USING (id = ANY(public.current_user_organization_ids()));

CREATE POLICY "orgs_insert" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User Organizations: simple user_id check
CREATE POLICY "user_orgs_select" ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_orgs_insert" ON user_organizations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Locations: check via helper function
CREATE POLICY "locations_select" ON locations
  FOR SELECT USING (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "locations_insert" ON locations
  FOR INSERT WITH CHECK (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "locations_update" ON locations
  FOR UPDATE USING (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "locations_delete" ON locations
  FOR DELETE USING (organization_id = ANY(public.current_user_organization_ids()));

-- Offerings
CREATE POLICY "offerings_select" ON offerings
  FOR SELECT USING (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "offerings_insert" ON offerings
  FOR INSERT WITH CHECK (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "offerings_update" ON offerings
  FOR UPDATE USING (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "offerings_delete" ON offerings
  FOR DELETE USING (organization_id = ANY(public.current_user_organization_ids()));

-- Resources
CREATE POLICY "resources_select" ON resources
  FOR SELECT USING (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "resources_insert" ON resources
  FOR INSERT WITH CHECK (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "resources_update" ON resources
  FOR UPDATE USING (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "resources_delete" ON resources
  FOR DELETE USING (organization_id = ANY(public.current_user_organization_ids()));

-- Bookings
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE USING (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "bookings_delete" ON bookings
  FOR DELETE USING (organization_id = ANY(public.current_user_organization_ids()));

-- Audit Logs
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (organization_id = ANY(public.current_user_organization_ids()));

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (organization_id = ANY(public.current_user_organization_ids()));
