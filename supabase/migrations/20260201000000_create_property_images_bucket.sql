-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view property images
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Policy to allow admins to upload property images
CREATE POLICY "Admins can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images' AND
    public.has_role(auth.uid(), 'admin')
  );

-- Policy to allow admins to delete property images
CREATE POLICY "Admins can delete property images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images' AND
    public.has_role(auth.uid(), 'admin')
  );
