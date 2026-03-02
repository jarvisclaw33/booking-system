-- RLS for Public Booking Platform + Admin/Staff Access
-- Created: 2026-02-17

-- ============================================================================
-- Helper function: Get current user's organization IDs
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(
    ARRAY(
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    ),
    ARRAY[]::UUID[]
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.user_org_ids() TO authenticated, anon, public;

-- ============================================================================
-- ORGANIZATIONS - Admin only
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orgs_select" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;

-- Only authenticated users in org can view
CREATE POLICY "orgs_select" ON organizations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND id = ANY(public.user_org_ids())
  );

-- Only authenticated users can create
CREATE POLICY "orgs_insert" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- USER_ORGANIZATIONS - Admin only
-- ============================================================================
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_orgs_select" ON user_organizations;
DROP POLICY IF EXISTS "user_orgs_insert" ON user_organizations;

-- Users can see their own memberships
CREATE POLICY "user_orgs_select" ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

-- Users can add themselves
CREATE POLICY "user_orgs_insert" ON user_organizations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- OFFERINGS (Services) - PUBLIC READ
-- ============================================================================
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offerings_select" ON offerings;
DROP POLICY IF EXISTS "offerings_insert" ON offerings;
DROP POLICY IF EXISTS "offerings_update" ON offerings;
DROP POLICY IF EXISTS "offerings_delete" ON offerings;

-- Anyone can read (public booking)
CREATE POLICY "offerings_select" ON offerings
  FOR SELECT USING (true);

-- Only authenticated users in org can modify
CREATE POLICY "offerings_insert" ON offerings
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

CREATE POLICY "offerings_update" ON offerings
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

CREATE POLICY "offerings_delete" ON offerings
  FOR DELETE USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

-- ============================================================================
-- RESOURCES - PUBLIC READ
-- ============================================================================
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resources_select" ON resources;
DROP POLICY IF EXISTS "resources_insert" ON resources;
DROP POLICY IF EXISTS "resources_update" ON resources;
DROP POLICY IF EXISTS "resources_delete" ON resources;

-- Anyone can read (public booking)
CREATE POLICY "resources_select" ON resources
  FOR SELECT USING (true);

-- Only authenticated users in org can modify
CREATE POLICY "resources_insert" ON resources
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

CREATE POLICY "resources_update" ON resources
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

CREATE POLICY "resources_delete" ON resources
  FOR DELETE USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

-- ============================================================================
-- LOCATIONS - Admin only (or read for staff)
-- ============================================================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "locations_select" ON locations;
DROP POLICY IF EXISTS "locations_insert" ON locations;
DROP POLICY IF EXISTS "locations_update" ON locations;
DROP POLICY IF EXISTS "locations_delete" ON locations;

-- Only authenticated users in org can view
CREATE POLICY "locations_select" ON locations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

-- Only authenticated users in org can modify
CREATE POLICY "locations_insert" ON locations
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

CREATE POLICY "locations_update" ON locations
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

CREATE POLICY "locations_delete" ON locations
  FOR DELETE USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

-- ============================================================================
-- BOOKINGS - Public CREATE, Admin/Staff READ/UPDATE
-- ============================================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select" ON bookings;
DROP POLICY IF EXISTS "bookings_insert" ON bookings;
DROP POLICY IF EXISTS "bookings_update" ON bookings;
DROP POLICY IF EXISTS "bookings_delete" ON bookings;

-- Authenticated users in org can read their org's bookings
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

-- Anyone can create (public booking) - but must provide valid organization_id
CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (organization_id IS NOT NULL);

-- Only authenticated users in org can modify
CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

CREATE POLICY "bookings_delete" ON bookings
  FOR DELETE USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

-- ============================================================================
-- AUDIT_LOGS - Admin only
-- ============================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;

-- Only authenticated users in org can view
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

-- Only authenticated users in org can create
CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );
