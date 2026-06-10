-- Update comments content length limit from 5000 to 10000

-- 1. Drop existing content CHECK constraint (auto-detects unnamed constraint)
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'comments'::regclass
    AND contype = 'c'
    AND pg_get_expr(conbin, conrelid) LIKE '%char_length(content)%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE comments DROP CONSTRAINT %I', con_name);
  END IF;
END $$;

-- 2. Add new CHECK constraint (10000 chars)
ALTER TABLE comments
  ADD CONSTRAINT comments_content_length_check
  CHECK (char_length(content) >= 1 AND char_length(content) <= 10000);
