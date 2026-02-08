-- Link blocked dates to reservations when applicable
ALTER TABLE public.blocked_dates
ADD COLUMN IF NOT EXISTS reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE;

-- Ensure one blocked period per reservation
CREATE UNIQUE INDEX IF NOT EXISTS blocked_dates_reservation_id_key
ON public.blocked_dates (reservation_id);
