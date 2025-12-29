import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlockedDate } from '@/lib/types';

export function useBlockedDates() {
  return useQuery({
    queryKey: ['blocked-dates'],
    queryFn: async (): Promise<BlockedDate[]> => {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateBlockedDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedDate: Omit<BlockedDate, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('blocked_dates')
        .insert(blockedDate)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
    },
  });
}

export function useDeleteBlockedDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
    },
  });
}
