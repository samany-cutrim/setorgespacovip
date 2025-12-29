import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PricingRule, PriceType } from '@/lib/types';
import { eachDayOfInterval, isWeekend, parseISO, format } from 'date-fns';

export function usePricingRules() {
  return useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async (): Promise<PricingRule[]> => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true)
        .order('price_type', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useAllPricingRules() {
  return useQuery({
    queryKey: ['all-pricing-rules'],
    queryFn: async (): Promise<PricingRule[]> => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .insert(rule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['all-pricing-rules'] });
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PricingRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['all-pricing-rules'] });
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      queryClient.invalidateQueries({ queryKey: ['all-pricing-rules'] });
    },
  });
}

export function calculateTotalPrice(
  checkIn: Date,
  checkOut: Date,
  pricingRules: PricingRule[]
): number {
  const days = eachDayOfInterval({ start: checkIn, end: checkOut }).slice(0, -1); // Exclude checkout day
  
  if (days.length === 0) return 0;

  const baseRule = pricingRules.find(r => r.price_type === 'base');
  const weekendRule = pricingRules.find(r => r.price_type === 'weekend');
  const baseRate = baseRule?.daily_rate || 350;
  const weekendRate = weekendRule?.daily_rate || baseRate * 1.2;

  // Check for packages
  const packageRules = pricingRules
    .filter(r => r.price_type === 'package' && r.min_nights && days.length >= r.min_nights)
    .sort((a, b) => (b.min_nights || 0) - (a.min_nights || 0));

  if (packageRules.length > 0) {
    return packageRules[0].daily_rate * days.length;
  }

  // Check for special dates (holiday, high_season)
  let total = 0;
  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    // Check high season
    const highSeasonRule = pricingRules.find(r => 
      r.price_type === 'high_season' &&
      r.start_date && r.end_date &&
      dateStr >= r.start_date && dateStr <= r.end_date
    );

    // Check holiday
    const holidayRule = pricingRules.find(r =>
      r.price_type === 'holiday' &&
      r.start_date && r.end_date &&
      dateStr >= r.start_date && dateStr <= r.end_date
    );

    if (holidayRule) {
      total += holidayRule.daily_rate;
    } else if (highSeasonRule) {
      total += highSeasonRule.daily_rate;
    } else if (isWeekend(day)) {
      total += weekendRate;
    } else {
      total += baseRate;
    }
  }

  return total;
}
