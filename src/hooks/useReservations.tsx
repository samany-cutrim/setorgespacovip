import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, ReservationStatus, PaymentStatus } from '@/lib/types';

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: async (): Promise<Reservation[]> => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, guest:guests(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpcomingReservations() {
  return useQuery({
    queryKey: ['upcoming-reservations'],
    queryFn: async (): Promise<Reservation[]> => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('reservations')
        .select('*, guest:guests(*)')
        .gte('check_in', today)
        .order('check_in', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useReservationsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: ['reservations-by-month', year, month],
    queryFn: async (): Promise<Reservation[]> => {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*, guest:guests(*)')
        .gte('check_in', startDate)
        .lte('check_in', endDate)
        .order('check_in', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservation: {
      guest_id: string;
      check_in: string;
      check_out: string;
      num_guests: number;
      total_amount: number;
      notes?: string;
      status?: ReservationStatus;
      payment_status?: PaymentStatus;
      deposit_amount?: number;
      discount_amount?: number;
      contract_url?: string | null;
    }) => {
      // Gerar tracking_code único (8 caracteres maiúsculos)
      const generateTrackingCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      const { data, error } = await supabase
        .from('reservations')
        .insert([
          {
            ...reservation,
            tracking_code: generateTrackingCode(),
            status: reservation.status || 'pending',
            payment_status: reservation.payment_status || 'pending',
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-by-month'] });
    },
  });
}

export function useCreateReservationWithGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      full_name: string;
      email: string;
      phone: string;
      document?: string | null;
      guest_notes?: string | null;
      check_in: string;
      check_out: string;
      num_guests: number;
      total_amount: number;
      discount_amount?: number;
      deposit_amount?: number;
      status?: ReservationStatus;
      payment_status?: PaymentStatus;
      reservation_notes?: string | null;
    }) => {
      const { data, error } = await supabase.rpc('create_reservation_with_guest', {
        p_full_name: payload.full_name,
        p_email: payload.email,
        p_phone: payload.phone,
        p_document: payload.document ?? null,
        p_guest_notes: payload.guest_notes ?? null,
        p_check_in: payload.check_in,
        p_check_out: payload.check_out,
        p_num_guests: payload.num_guests,
        p_total_amount: payload.total_amount,
        p_discount_amount: payload.discount_amount ?? 0,
        p_deposit_amount: payload.deposit_amount ?? 0,
        p_status: payload.status ?? 'pending',
        p_payment_status: payload.payment_status ?? 'pending',
        p_reservation_notes: payload.reservation_notes ?? null,
      });

      if (error) throw error;
      return data as Reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-by-month'] });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reservation> & { id: string }) => {
      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-by-month'] });
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-by-month'] });
    },
  });
}
