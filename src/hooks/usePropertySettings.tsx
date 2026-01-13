import { useQuery } from '@tanstack/react-query';
// ...supabase removido...
import { PropertySettings } from '@/lib/types';

export function usePropertySettings() {
  return useQuery({
    queryKey: ['property-settings'],
    queryFn: async (): Promise<PropertySettings | null> => {
      // TODO: Implementar chamada à API REST
      return null;
    },
  });
}
