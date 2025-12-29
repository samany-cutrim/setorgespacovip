-- Add discount and deposit columns to reservations
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0;