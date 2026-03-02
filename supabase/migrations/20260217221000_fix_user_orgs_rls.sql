-- Disable RLS on user_organizations to break recursion
ALTER TABLE user_organizations DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_orgs_select" ON user_organizations;
DROP POLICY IF EXISTS "user_orgs_insert" ON user_organizations;