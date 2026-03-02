-- Recreate RLS policies properly
-- Drop existing first

DROP POLICY IF EXISTS "Users can view their orgs" ON organizations;
DROP POLICY IF EXISTS "Users can create orgs" ON organizations;
DROP POLICY IF EXISTS "Users can view own org memberships" ON user_organizations;
DROP POLICY IF EXISTS "Users can insert own org memberships" ON user_organizations;
DROP POLICY IF EXISTS "Users can view own orgs" ON user_organizations;
DROP POLICY IF EXISTS "Users can insert own orgs" ON user_organizations;

-- New policies for organizations
CREATE POLICY "orgs_select" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "orgs_insert" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- New policies for user_organizations
CREATE POLICY "user_orgs_select" ON user_organizations
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "user_orgs_insert" ON user_organizations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');
