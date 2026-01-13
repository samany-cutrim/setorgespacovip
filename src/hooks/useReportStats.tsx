import { useQuery } from '@tanstack/react-query';
// ...supabase removido...
import { format, eachMonthOfInterval, startOfMonth, endOfMonth, differenceInDays, parseISO, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyStats {
  month: string;
  monthLabel: string;
  revenue: number;
  occupiedDays: number;
  totalDays: number;
  occupancyRate: number;
}

export function useReportStats(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['report-stats', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async (): Promise<MonthlyStats[]> => {
      const months: MonthlyStats[] = [];

      // Get all months in the interval
      const monthsInRange = eachMonthOfInterval({ start: startDate, end: endDate });

      monthsInRange.forEach(monthDate => {
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const totalDays = differenceInDays(end, start) + 1;

        months.push({
          month: format(monthDate, 'yyyy-MM'),
          monthLabel: format(monthDate, 'MMM/yy', { locale: ptBR }),
          revenue: 0,
          occupiedDays: 0,
          totalDays,
          occupancyRate: 0,
        });
      });

      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      // Fetch payments for the period
      // ...remover chamada ao supabase, substituir por chamada à nova API REST...
        .from('payments')
        .select('amount, payment_date')
        .gte('payment_date', startStr)
        .lte('payment_date', endStr);

      // Fetch reservations for occupancy
      // ...remover chamada ao supabase, substituir por chamada à nova API REST...
        .from('reservations')
        .select('check_in, check_out, status')
        .in('status', ['confirmed', 'completed'])
        .gte('check_out', startStr)
        .lte('check_in', endStr);

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
    enabled: !!startDate && !!endDate,
  });
}
