import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AudienciaTRT } from '@/lib/types';

export function useAudiencias(advogadoFilter?: string, refetchInterval?: number) {
  return useQuery({
    queryKey: ['audiencias', advogadoFilter],
    queryFn: async (): Promise<AudienciaTRT[]> => {
      let query = supabase
        .from('audiencias_trt')
        .select('*')
        .order('data_audiencia', { ascending: false });

      if (advogadoFilter) {
        query = query.ilike('advogado_parte', `%${advogadoFilter}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    refetchInterval: refetchInterval ?? 60000, // Default: 60 seconds for real-time updates
  });
}

export function useAudienciaById(id: string | undefined) {
  return useQuery({
    queryKey: ['audiencia', id],
    queryFn: async (): Promise<AudienciaTRT | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('audiencias_trt')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAudiencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (audiencia: Omit<AudienciaTRT, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('audiencias_trt')
        .insert(audiencia)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiencias'] });
    },
  });
}

export function useUpdateAudiencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AudienciaTRT> & { id: string }) => {
      const { data, error } = await supabase
        .from('audiencias_trt')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiencias'] });
    },
  });
}

export function useDeleteAudiencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('audiencias_trt')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiencias'] });
    },
  });
}
