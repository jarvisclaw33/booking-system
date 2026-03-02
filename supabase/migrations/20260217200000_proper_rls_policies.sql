-- Enable RLS with proper policies for booking-system
-- Created: 2026-02-17
-- Fixed: function in public schema instead of auth schema

-- ============================================================================
-- HELPER FUNCTION: Check if user belongs to an organization (in public schema)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.user_organization_ids()
RETURNS TABLE(organization_id UUID) AS $$
  SELECT organization_id 
  FROM user_organizations 
  WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.user_organization_ids() TO authenticated;

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orgs_select" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;

CREATE POLICY "orgs_select" ON organizations
  FOR SELECT USING (id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "orgs_insert" ON organizations
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_organizations WHERE organization_id = id)
  );

-- ============================================================================
-- USER_ORGANIZATIONS
-- ============================================================================

ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_orgs_select" ON user_organizations;
DROP POLICY IF EXISTS "user_orgs_insert" ON user_organizations;

CREATE POLICY "user_orgs_select" ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_orgs_insert" ON user_organizations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- LOCATIONS
-- ============================================================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "locations_select" ON locations;
DROP POLICY IF EXISTS "locations_insert" ON locations;
DROP POLICY IF EXISTS "locations_update" ON locations;
DROP POLICY IF EXISTS "locations_delete" ON locations;

CREATE POLICY "locations_select" ON locations
  FOR SELECT USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "locations_insert" ON locations
  FOR INSERT WITH CHECK (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "locations_update" ON locations
  FOR UPDATE USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "locations_delete" ON locations
  FOR DELETE USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

-- ============================================================================
-- OFFERINGS (Services)
-- ============================================================================

ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offerings_select" ON offerings;
DROP POLICY IF EXISTS "offerings_insert" ON offerings;
DROP POLICY IF EXISTS "offerings_update" ON offerings;
DROP POLICY IF EXISTS "offerings_delete" ON offerings;

CREATE POLICY "offerings_select" ON offerings
  FOR SELECT USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "offerings_insert" ON offerings
  FOR INSERT WITH CHECK (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "offerings_update" ON offerings
  FOR UPDATE USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "offerings_delete" ON offerings
  FOR DELETE USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

-- ============================================================================
-- RESOURCES
-- ============================================================================

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resources_select" ON resources;
DROP POLICY IF EXISTS "resources_insert" ON resources;
DROP POLICY IF EXISTS "resources_update" ON resources;
DROP POLICY IF EXISTS "resources_delete" ON resources;

CREATE POLICY "resources_select" ON resources
  FOR SELECT USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "resources_insert" ON resources
  FOR INSERT WITH CHECK (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "resources_update" ON resources
  FOR UPDATE USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "resources_delete" ON resources
  FOR DELETE USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

-- ============================================================================
-- BOOKINGS
-- ============================================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select" ON bookings;
DROP POLICY IF EXISTS "bookings_insert" ON bookings;
DROP POLICY IF EXISTS "bookings_update" ON bookings;
DROP POLICY IF EXISTS "bookings_delete" ON bookings;

CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "bookings_delete" ON bookings
  FOR DELETE USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

-- ============================================================================
-- AUDIT_LOGS
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (organization_id IN (SELECT * FROM public.user_organization_ids()));

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (organization_id IN (SELECT * FROM public.user_organization_ids()));
