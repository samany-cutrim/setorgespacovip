import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ...supabase removido...
import { Payment } from '@/lib/types';

export function usePaymentsByReservation(reservationId: string | undefined) {
  return useQuery({
    queryKey: ['payments', reservationId],
    queryFn: async (): Promise<Payment[]> => {
      if (!reservationId) return [];

      // TODO: Implementar chamada à API REST
      return [];
    },
    enabled: !!reservationId,
  });
}

export function useAllPayments() {
  return useQuery({
    queryKey: ['all-payments'],
    queryFn: async (): Promise<(Payment & { reservation: { check_in: string; check_out: string; guest: { full_name: string } | null } })[]> => {
      // TODO: Implementar chamada à API REST
      return [];
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<Payment, 'id' | 'created_at'>) => {
      // TODO: Implementar chamada à API REST
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['all-payments'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implementar chamada à API REST
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['all-payments'] });
    },
  });
}

export function useMonthlyRevenue(year: number, month: number) {
  return useQuery({
    queryKey: ['monthly-revenue', year, month],
    queryFn: async (): Promise<number> => {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // TODO: Implementar chamada à API REST
      return 0;
    },
  });
}
