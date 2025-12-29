import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PropertySettings } from '@/lib/types';

export function usePropertySettings() {
  return useQuery({
    queryKey: ['property-settings'],
    queryFn: async (): Promise<PropertySettings | null> => {
      const { data, error } = await supabase
        .from('property_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
