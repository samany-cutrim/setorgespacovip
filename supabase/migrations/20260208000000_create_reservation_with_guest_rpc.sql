-- Create a single RPC to insert guest and reservation together
CREATE OR REPLACE FUNCTION public.create_reservation_with_guest(
  p_full_name text,
  p_email text,
  p_phone text,
  p_document text,
  p_guest_notes text,
  p_check_in date,
  p_check_out date,
  p_num_guests integer,
  p_total_amount numeric,
  p_discount_amount numeric,
  p_deposit_amount numeric,
  p_status reservation_status,
  p_payment_status payment_status,
  p_reservation_notes text
)
RETURNS public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_guest_id uuid;
  v_reservation public.reservations;
BEGIN
  INSERT INTO public.guests (full_name, email, phone, document, notes)
  VALUES (p_full_name, p_email, p_phone, p_document, p_guest_notes)
  RETURNING id INTO v_guest_id;

  INSERT INTO public.reservations (
    guest_id,
    check_in,
    check_out,
    num_guests,
    total_amount,
    discount_amount,
    deposit_amount,
    status,
    payment_status,
    notes
  )
  VALUES (
    v_guest_id,
    p_check_in,
    p_check_out,
    p_num_guests,
    p_total_amount,
    p_discount_amount,
    p_deposit_amount,
    COALESCE(p_status, 'pending'),
    COALESCE(p_payment_status, 'pending'),
    p_reservation_notes
  )
  RETURNING * INTO v_reservation;

  RETURN v_reservation;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_reservation_with_guest(
  text, text, text, text, text, date, date, integer, numeric, numeric, numeric, reservation_status, payment_status, text
) TO anon, authenticated;
