import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PropertySettings } from '@/lib/types';

export function usePropertySettings() {
  return useQuery({
    queryKey: ['property-settings'],
    queryFn: async (): Promise<PropertySettings | null> => {
      const { data, error } = await supabase
        .from('property_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
  });
}

export function useUpdatePropertySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<PropertySettings> & { id: string }) => {
      const { id, ...data } = updates;
      const { data: result, error } = await supabase
        .from('property_settings')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-settings'] });
    },
  });
}

export function useCreatePropertySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Omit<PropertySettings, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('property_settings')
        .insert([settings])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-settings'] });
    },
  });
}
