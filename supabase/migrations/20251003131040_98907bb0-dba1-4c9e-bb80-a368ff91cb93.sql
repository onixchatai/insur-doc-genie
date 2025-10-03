-- Create storage bucket for item photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for item-photos bucket
CREATE POLICY "Users can upload their own item photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'item-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own item photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'item-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view item photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'item-photos');

CREATE POLICY "Users can delete their own item photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'item-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add image_url column to inventory_items table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.inventory_items 
    ADD COLUMN image_url TEXT;
  END IF;
END $$;