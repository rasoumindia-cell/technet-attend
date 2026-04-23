-- Create social_links table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT NOT NULL, -- facebook, instagram, gmb, etc.
  thumbnail_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "social_links_select" ON social_links FOR SELECT USING (true);
CREATE POLICY "social_links_admin_all" ON social_links FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Insert sample data
INSERT INTO social_links (title, url, platform, description, sort_order) VALUES
('Latest Facebook Update', 'https://facebook.com/yourpage/posts/1', 'facebook', 'Check out our latest news', 1),
('Instagram Photo', 'https://instagram.com/p/sample1', 'instagram', 'New product showcase', 2),
('Google Business Post', 'https://g.page/yourbusiness/posts/1', 'gmb', 'Customer review highlight', 3),
('Facebook Event', 'https://facebook.com/events/sample', 'facebook', 'Upcoming event details', 4),
('Instagram Story', 'https://instagram.com/stories/sample', 'instagram', 'Behind the scenes', 5);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_social_links_updated_at ON social_links;
CREATE TRIGGER update_social_links_updated_at
    BEFORE UPDATE ON social_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
