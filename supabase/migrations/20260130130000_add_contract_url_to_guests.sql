-- Add contract_url column to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS contract_url TEXT;

-- Create storage bucket for contracts if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract_files', 'contract_files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users (admin) to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contract_files');

-- Policy to allow authenticated users to view files
CREATE POLICY "Allow authenticated select"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'contract_files');

-- Policy to allow authenticated users to update files
CREATE POLICY "Allow authenticated update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'contract_files');

-- Policy to allow authenticated users to delete files
CREATE POLICY "Allow authenticated delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'contract_files');
