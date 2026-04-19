-- Drop and recreate tables
DROP TABLE IF EXISTS credits CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  customer_id TEXT,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credits table
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  valid_until DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies - allow all authenticated users
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "attendance_insert" ON attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "attendance_delete" ON attendance FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "credits_select" ON credits FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "credits_insert" ON credits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert existing users from auth
INSERT INTO profiles (id, customer_id, name, role)
SELECT id, 'CUST-' || upper(substr(id::text, 1, 8)), COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'customer'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Set roles
UPDATE profiles SET role = 'customer' WHERE id = (SELECT id FROM auth.users WHERE email = 'rasoumindia@gmail.com');
UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'soummajumder231@gmail.com');