-- Simplified RLS policies - fix booking read access
-- Keep public insert, authenticated read

-- Bookings: anyone can insert, authenticated can read
DROP POLICY IF EXISTS "bookings_select" ON bookings;
DROP POLICY IF EXISTS "bookings_insert" ON bookings;

-- Public can create bookings
CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (true);

-- Authenticated users in org can read
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

-- Locations: authenticated in org
DROP POLICY IF EXISTS "locations_select" ON locations;
CREATE POLICY "locations_select" ON locations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND organization_id = ANY(public.user_org_ids())
  );

-- Organizations: authenticated in org
DROP POLICY IF EXISTS "orgs_select" ON organizations;
CREATE POLICY "orgs_select" ON organizations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND id = ANY(public.user_org_ids())
  );