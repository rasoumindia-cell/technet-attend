-- Disable RLS on all tables temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE credits DISABLE ROW LEVEL SECURITY;

-- Re-enable with permissive policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- Allow everything for authenticated users
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_all" ON profiles;

DROP POLICY IF EXISTS "attendance_select" ON attendance;
DROP POLICY IF EXISTS "attendance_insert" ON attendance;
DROP POLICY IF EXISTS "attendance_delete" ON attendance;
DROP POLICY IF EXISTS "attendance_all" ON attendance;

DROP POLICY IF EXISTS "credits_select" ON credits;
DROP POLICY IF EXISTS "credits_insert" ON credits;
DROP POLICY IF EXISTS "credits_all" ON credits;

-- Create permissive policies
CREATE POLICY "profiles_all" ON profiles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "attendance_all" ON attendance FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "credits_all" ON credits FOR ALL USING (auth.uid() IS NOT NULL);