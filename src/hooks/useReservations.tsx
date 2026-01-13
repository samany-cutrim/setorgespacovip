import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ...supabase removido...
import { Reservation, ReservationStatus, PaymentStatus } from '@/lib/types';

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: async (): Promise<Reservation[]> => {
      // TODO: Implementar chamada à API REST
      return [];
    },
  });
}

export function useUpcomingReservations() {
  return useQuery({
    queryKey: ['upcoming-reservations'],
    queryFn: async (): Promise<Reservation[]> => {
      // TODO: Implementar chamada à API REST
      return [];
    },
  });
}

export function useReservationsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: ['reservations-by-month', year, month],
    queryFn: async (): Promise<Reservation[]> => {
      // TODO: Implementar chamada à API REST
      return [];
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
      // TODO: Implementar chamada à API REST
      return null;
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
      // TODO: Implementar chamada à API REST
      return null;
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
      // TODO: Implementar chamada à API REST
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-by-month'] });
    },
  });
}
