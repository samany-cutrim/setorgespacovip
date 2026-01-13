import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ...supabase removido...
import { Payment } from '@/lib/types';

export function usePaymentsByReservation(reservationId: string | undefined) {
  return useQuery({
    queryKey: ['payments', reservationId],
    queryFn: async (): Promise<Payment[]> => {
      if (!reservationId) return [];

      // ...remover chamada ao supabase, substituir por chamada à nova API REST...
        .from('payments')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!reservationId,
  });
}

export function useAllPayments() {
  return useQuery({
    queryKey: ['all-payments'],
    queryFn: async (): Promise<(Payment & { reservation: { check_in: string; check_out: string; guest: { full_name: string } | null } })[]> => {
      // ...remover chamada ao supabase, substituir por chamada à nova API REST...
        .from('payments')
        .select(`
          *,
          reservation:reservations(
            check_in,
            check_out,
            guest:guests(full_name)
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<Payment, 'id' | 'created_at'>) => {
      // ...remover chamada ao supabase, substituir por chamada à nova API REST...
        .from('payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      // ...remover chamada ao supabase, substituir por chamada à nova API REST...
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

      // ...remover chamada ao supabase, substituir por chamada à nova API REST...
        .from('payments')
        .select('amount')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);

      if (error) throw error;
      return (data || []).reduce((sum, p) => sum + Number(p.amount), 0);
    },
  });
}
