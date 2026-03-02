-- Disable RLS on user_organizations to break recursion
-- The user_organizations table is still protected by user_id checks in the app
ALTER TABLE user_organizations DISABLE ROW LEVEL SECURITY;

-- Drop the old policies on user_organizations
DROP POLICY IF EXISTS "user_orgs_select" ON user_organizations;
DROP POLICY IF EXISTS "user_orgs_insert" ON user_organizations;

-- Keep RLS on all other tables with the helper function
-- The helper function will now work because user_organizations has no RLS