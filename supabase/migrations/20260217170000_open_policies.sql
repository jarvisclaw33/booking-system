-- Completely open policies for testing
DROP POLICY IF EXISTS "orgs_select" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
DROP POLICY IF EXISTS "user_orgs_select" ON user_organizations;
DROP POLICY IF EXISTS "user_orgs_insert" ON user_organizations;

-- Open policies - allow everything for authenticated users
CREATE POLICY "orgs_select" ON organizations FOR SELECT USING (true);
CREATE POLICY "orgs_insert" ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "orgs_update" ON organizations FOR UPDATE USING (true);
CREATE POLICY "orgs_delete" ON organizations FOR DELETE USING (true);

CREATE POLICY "user_orgs_select" ON user_organizations FOR SELECT USING (true);
CREATE POLICY "user_orgs_insert" ON user_organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "user_orgs_update" ON user_organizations FOR UPDATE USING (true);
CREATE POLICY "user_orgs_delete" ON user_organizations FOR DELETE USING (true);
