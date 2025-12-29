import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, ReservationStatus, PaymentStatus } from '@/lib/types';

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: async (): Promise<Reservation[]> => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests(*)
        `)
        .order('check_in', { ascending: true });

      if (error) throw error;
      return (data || []) as Reservation[];
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
        .select(`
          *,
          guest:guests(*)
        `)
        .gte('check_in', today)
        .in('status', ['pending', 'confirmed'])
        .order('check_in', { ascending: true })
        .limit(5);

      if (error) throw error;
      return (data || []) as Reservation[];
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
        .select(`
          *,
          guest:guests(*)
        `)
        .or(`check_in.gte.${startDate},check_out.gte.${startDate}`)
        .or(`check_in.lte.${endDate},check_out.lte.${endDate}`)
        .neq('status', 'cancelled');

      if (error) throw error;
      return (data || []) as Reservation[];
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservation: {
      guest_id?: string;
      check_in: string;
      check_out: string;
      num_guests: number;
      total_amount: number;
      notes?: string;
      status?: ReservationStatus;
    }) => {
      const { data, error } = await supabase
        .from('reservations')
        .insert(reservation)
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
