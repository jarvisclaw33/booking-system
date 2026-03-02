-- Ultra-simple RLS: no helper function, just boolean checks
-- Step 1: Drop all policies that depend on the function
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
DROP POLICY IF EXISTS "locations_select" ON locations;
DROP POLICY IF EXISTS "locations_insert" ON locations;
DROP POLICY IF EXISTS "locations_update" ON locations;
DROP POLICY IF EXISTS "locations_delete" ON locations;
DROP POLICY IF EXISTS "orgs_select" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
DROP POLICY IF EXISTS "user_orgs_select" ON user_organizations;
DROP POLICY IF EXISTS "user_orgs_insert" ON user_organizations;
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;

-- Step 2: Drop the helper function
DROP FUNCTION IF EXISTS public.user_org_ids();

-- Step 3: Create simple boolean policies

-- OFFERINGS - public read/write for now (simplest)
CREATE POLICY "offerings_select" ON offerings FOR SELECT USING (true);
CREATE POLICY "offerings_insert" ON offerings FOR INSERT WITH CHECK (true);
CREATE POLICY "offerings_update" ON offerings FOR UPDATE USING (true);
CREATE POLICY "offerings_delete" ON offerings FOR DELETE USING (true);

-- RESOURCES - public read/write
CREATE POLICY "resources_select" ON resources FOR SELECT USING (true);
CREATE POLICY "resources_insert" ON resources FOR INSERT WITH CHECK (true);
CREATE POLICY "resources_update" ON resources FOR UPDATE USING (true);
CREATE POLICY "resources_delete" ON resources FOR DELETE USING (true);

-- BOOKINGS - public read/write
CREATE POLICY "bookings_select" ON bookings FOR SELECT USING (true);
CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_update" ON bookings FOR UPDATE USING (true);
CREATE POLICY "bookings_delete" ON bookings FOR DELETE USING (true);

-- LOCATIONS - public for now
CREATE POLICY "locations_select" ON locations FOR SELECT USING (true);
CREATE POLICY "locations_insert" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "locations_update" ON locations FOR UPDATE USING (true);
CREATE POLICY "locations_delete" ON locations FOR DELETE USING (true);

-- ORGANIZATIONS - public for now
CREATE POLICY "orgs_select" ON organizations FOR SELECT USING (true);
CREATE POLICY "orgs_insert" ON organizations FOR INSERT WITH CHECK (true);

-- USER_ORGANIZATIONS - public for now
CREATE POLICY "user_orgs_select" ON user_organizations FOR SELECT USING (true);
CREATE POLICY "user_orgs_insert" ON user_organizations FOR INSERT WITH CHECK (true);

-- AUDIT_LOGS - public for now
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);