-- Paperlevels Database Schema
-- Compatible with Supabase PostgreSQL

-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- loglines table
CREATE TABLE IF NOT EXISTS loglines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 140),
  category VARCHAR(50) NULL,
  share_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logline_id UUID NOT NULL REFERENCES loglines(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for loglines
CREATE INDEX IF NOT EXISTS idx_loglines_created_at ON loglines(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loglines_share_count ON loglines(share_count DESC);
CREATE INDEX IF NOT EXISTS idx_loglines_content_trgm ON loglines USING gin (content gin_trgm_ops);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_logline_id ON comments(logline_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Trigger to update updated_at on loglines
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loglines_updated_at
  BEFORE UPDATE ON loglines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE loglines ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read loglines" ON loglines
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read comments" ON comments
  FOR SELECT USING (true);

-- Allow anonymous insert (no auth required)
CREATE POLICY "Allow anonymous insert loglines" ON loglines
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Only authenticated users (admins) can update/delete
CREATE POLICY "Allow admin update loglines" ON loglines
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete loglines" ON loglines
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete comments" ON comments
  FOR DELETE USING (auth.role() = 'authenticated');
