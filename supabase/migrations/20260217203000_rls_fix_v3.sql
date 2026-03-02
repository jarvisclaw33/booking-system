-- Fix RLS policies - Step 1: Drop all old policies first
-- Then Step 2: Drop function and create new policies

-- Drop all old policies that depend on the function
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

-- Now drop the function
DROP FUNCTION IF EXISTS public.user_organization_ids();

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

-- Users can view organizations they belong to
CREATE POLICY "orgs_select" ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = id)
  );

-- Allow any authenticated user to create an org
CREATE POLICY "orgs_insert" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- USER_ORGANIZATIONS - Critical: must be simple to avoid recursion
-- ============================================================================

-- Users can see their own memberships
CREATE POLICY "user_orgs_select" ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

-- Users can add themselves to organizations
CREATE POLICY "user_orgs_insert" ON user_organizations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- LOCATIONS
-- ============================================================================

CREATE POLICY "locations_select" ON locations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = locations.organization_id)
  );

CREATE POLICY "locations_insert" ON locations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = locations.organization_id)
  );

CREATE POLICY "locations_update" ON locations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = locations.organization_id)
  );

CREATE POLICY "locations_delete" ON locations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = locations.organization_id)
  );

-- ============================================================================
-- OFFERINGS
-- ============================================================================

CREATE POLICY "offerings_select" ON offerings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = offerings.organization_id)
  );

CREATE POLICY "offerings_insert" ON offerings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = offerings.organization_id)
  );

CREATE POLICY "offerings_update" ON offerings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = offerings.organization_id)
  );

CREATE POLICY "offerings_delete" ON offerings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = offerings.organization_id)
  );

-- ============================================================================
-- RESOURCES
-- ============================================================================

CREATE POLICY "resources_select" ON resources
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = resources.organization_id)
  );

CREATE POLICY "resources_insert" ON resources
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = resources.organization_id)
  );

CREATE POLICY "resources_update" ON resources
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = resources.organization_id)
  );

CREATE POLICY "resources_delete" ON resources
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = resources.organization_id)
  );

-- ============================================================================
-- BOOKINGS
-- ============================================================================

CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = bookings.organization_id)
  );

CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = bookings.organization_id)
  );

CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = bookings.organization_id)
  );

CREATE POLICY "bookings_delete" ON bookings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = bookings.organization_id)
  );

-- ============================================================================
-- AUDIT_LOGS
-- ============================================================================

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = audit_logs.organization_id)
  );

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND organization_id = audit_logs.organization_id)
  );
