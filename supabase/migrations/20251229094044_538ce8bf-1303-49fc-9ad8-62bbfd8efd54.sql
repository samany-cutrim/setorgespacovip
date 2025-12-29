-- Add contract acceptance fields to reservations
ALTER TABLE public.reservations 
ADD COLUMN contract_accepted BOOLEAN DEFAULT false,
ADD COLUMN contract_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN contract_ip TEXT;

-- Create index for faster lookups by guest phone
CREATE INDEX idx_reservations_guest_id ON public.reservations(guest_id);

-- Allow guests to update their own reservation (for contract acceptance)
CREATE POLICY "Guests can accept contract via tracking code"
ON public.reservations
FOR UPDATE
USING (tracking_code IS NOT NULL)
WITH CHECK (tracking_code IS NOT NULL);