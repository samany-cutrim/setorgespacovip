-- Add tracking code column to reservations
ALTER TABLE public.reservations 
ADD COLUMN tracking_code TEXT UNIQUE;

-- Create function to generate unique tracking code
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.tracking_code := UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate tracking code on insert
CREATE TRIGGER generate_reservation_tracking_code
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.generate_tracking_code();

-- Allow anyone to view their own reservation by tracking code
CREATE POLICY "Anyone can view reservation by tracking code"
ON public.reservations
FOR SELECT
USING (tracking_code IS NOT NULL);

-- Update existing reservations with tracking codes
UPDATE public.reservations
SET tracking_code = UPPER(SUBSTRING(MD5(id::text || created_at::text) FROM 1 FOR 8))
WHERE tracking_code IS NULL;