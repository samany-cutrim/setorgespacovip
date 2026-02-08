-- Add contract_url column to reservations
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS contract_url TEXT;
