import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays, parseISO, eachDayOfInterval, isWithinInterval } from 'date-fns';

interface MonthlyStats {
  month: string;
  monthLabel: string;
  revenue: number;
  occupiedDays: number;
  totalDays: number;
  occupancyRate: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<MonthlyStats[]> => {
      const now = new Date();
      const months: MonthlyStats[] = [];

      // Get last 6 months of data
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const startStr = format(start, 'yyyy-MM-dd');
        const endStr = format(end, 'yyyy-MM-dd');
        const totalDays = differenceInDays(end, start) + 1;

        months.push({
          month: format(monthDate, 'yyyy-MM'),
          monthLabel: format(monthDate, 'MMM'),
          revenue: 0,
          occupiedDays: 0,
          totalDays,
          occupancyRate: 0,
        });
      }

      // Fetch payments for the period
      const sixMonthsAgo = format(subMonths(now, 5), 'yyyy-MM-dd');
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .gte('payment_date', sixMonthsAgo);

      // Fetch reservations for occupancy
      const { data: reservations } = await supabase
        .from('reservations')
        .select('check_in, check_out, status')
        .in('status', ['confirmed', 'completed'])
        .gte('check_out', sixMonthsAgo);

      // Calculate revenue per month
      (payments || []).forEach(payment => {
        const paymentMonth = format(parseISO(payment.payment_date), 'yyyy-MM');
        const monthData = months.find(m => m.month === paymentMonth);
        if (monthData) {
          monthData.revenue += Number(payment.amount);
        }
      });

      // Calculate occupied days per month
      (reservations || []).forEach(reservation => {
        const checkIn = parseISO(reservation.check_in);
        const checkOut = parseISO(reservation.check_out);
        
        // Get all days of the reservation
        const reservationDays = eachDayOfInterval({ start: checkIn, end: checkOut });
        
        months.forEach(monthData => {
          const monthStart = startOfMonth(parseISO(`${monthData.month}-01`));
          const monthEnd = endOfMonth(monthStart);
          
          // Count days that fall within this month
          const daysInMonth = reservationDays.filter(day => 
            isWithinInterval(day, { start: monthStart, end: monthEnd })
          ).length;
          
          monthData.occupiedDays += daysInMonth;
        });
      });

      // Calculate occupancy rate
      months.forEach(monthData => {
        monthData.occupancyRate = Math.min(100, Math.round((monthData.occupiedDays / monthData.totalDays) * 100));
      });

      return months;
    },
  });
}
