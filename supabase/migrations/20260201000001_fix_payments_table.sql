-- Add status field to payments table with constraint
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'received' 
CHECK (status IN ('received', 'pending', 'cancelled'));

-- Make reservation_id nullable to allow standalone income entries
ALTER TABLE public.payments 
ALTER COLUMN reservation_id DROP NOT NULL;

-- Update existing payments to have 'received' status
UPDATE public.payments 
SET status = 'received' 
WHERE status IS NULL;
