import { useQuery } from '@tanstack/react-query';
// ...supabase removido...
import { PropertySettings } from '@/lib/types';

export function usePropertySettings() {
  return useQuery({
    queryKey: ['property-settings'],
    queryFn: async (): Promise<PropertySettings | null> => {
      // ...remover chamada ao supabase, substituir por chamada à nova API REST...
        .from('property_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
