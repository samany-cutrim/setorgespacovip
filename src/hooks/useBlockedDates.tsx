import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlockedDate } from '@/lib/types';

const API_URL = '/api/blocked-dates';

export function useBlockedDates() {
  return useQuery({
    queryKey: ['blocked-dates'],
    queryFn: async (): Promise<BlockedDate[]> => {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erro ao buscar datas bloqueadas');
      return await res.json();
    },
  });
}

export function useCreateBlockedDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockedDate: Omit<BlockedDate, 'id' | 'created_at'>) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockedDate),
      });
      if (!res.ok) throw new Error('Erro ao criar data bloqueada');
      return await res.json();
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
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar data bloqueada');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
    },
  });
}
