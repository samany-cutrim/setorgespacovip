-- Add reservation count to guests and keep it in sync
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS reservation_count INTEGER NOT NULL DEFAULT 0;

-- Backfill counts for existing guests
UPDATE public.guests g
SET reservation_count = COALESCE(
  (
    SELECT COUNT(*)
    FROM public.reservations r
    WHERE r.guest_id = g.id
  ),
  0
);

-- Keep reservation_count in sync with reservations table
CREATE OR REPLACE FUNCTION public.sync_guest_reservation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.guest_id IS NOT NULL THEN
      UPDATE public.guests
      SET reservation_count = reservation_count + 1
      WHERE id = NEW.guest_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.guest_id IS NOT NULL THEN
      UPDATE public.guests
      SET reservation_count = GREATEST(reservation_count - 1, 0)
      WHERE id = OLD.guest_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.guest_id IS DISTINCT FROM OLD.guest_id THEN
      IF OLD.guest_id IS NOT NULL THEN
        UPDATE public.guests
        SET reservation_count = GREATEST(reservation_count - 1, 0)
        WHERE id = OLD.guest_id;
      END IF;
      IF NEW.guest_id IS NOT NULL THEN
        UPDATE public.guests
        SET reservation_count = reservation_count + 1
        WHERE id = NEW.guest_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_guest_reservation_count_insert ON public.reservations;
DROP TRIGGER IF EXISTS sync_guest_reservation_count_update ON public.reservations;
DROP TRIGGER IF EXISTS sync_guest_reservation_count_delete ON public.reservations;

CREATE TRIGGER sync_guest_reservation_count_insert
AFTER INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_guest_reservation_count();

CREATE TRIGGER sync_guest_reservation_count_update
AFTER UPDATE OF guest_id ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_guest_reservation_count();

CREATE TRIGGER sync_guest_reservation_count_delete
AFTER DELETE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_guest_reservation_count();
