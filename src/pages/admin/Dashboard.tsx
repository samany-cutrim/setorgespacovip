import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReservations, useUpcomingReservations } from '@/hooks/useReservations';
import { useMonthlyRevenue } from '@/hooks/usePayments';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useReportStats } from '@/hooks/useReportStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChartContainer, 
  ChartTooltip
} from '@/components/ui/chart';
// importação removida: recharts removido por CSP
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { ReportDateFilter } from '@/components/admin/ReportDateFilter';
// ...supabase removido...

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-muted text-muted-foreground border-muted',
};

const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Concluída',
};

const revenueChartConfig = {
  revenue: {
    label: 'Receita',
    color: 'hsl(var(--primary))',
  },
};

const occupancyChartConfig = {
  occupancyRate: {
    label: 'Taxa de Ocupação',
    color: 'hsl(var(--accent))',
  },
};

export default function AdminDashboard() {
  const { data: reservations = [] } = useReservations();
  const { data: upcomingReservations = [] } = useUpcomingReservations();
  const { data: dashboardStats = [] } = useDashboardStats();
  
  const now = new Date();
  const { data: monthlyRevenue = 0 } = useMonthlyRevenue(now.getFullYear(), now.getMonth());

  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;

  const handleExportPDF = async (startDate: Date, endDate: Date) => {
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    // Fetch data for the custom date range
    // ...remover chamada ao supabase, substituir por chamada à nova API REST...
      .from('payments')
      .select('amount, payment_date')
      .gte('payment_date', startStr)
      .lte('payment_date', endStr);

    // ...remover chamada ao supabase, substituir por chamada à nova API REST...
      .from('reservations')
      .select('check_in, check_out, status')
      .in('status', ['confirmed', 'completed'])
      .gte('check_out', startStr)
      .lte('check_in', endStr);

    // Calculate monthly stats for the report
    const monthsInRange: { month: string; label: string; revenue: number; occupiedDays: number; totalDays: number }[] = [];
    let currentDate = startOfMonth(startDate);
    
    while (currentDate <= endDate) {
      const monthEnd = endOfMonth(currentDate);
      const daysInMonth = monthEnd.getDate();
      
      monthsInRange.push({
        month: format(currentDate, 'yyyy-MM'),
        label: format(currentDate, 'MMM/yy', { locale: ptBR }),
        revenue: 0,
        occupiedDays: 0,
        totalDays: daysInMonth,
      });
      
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    // Calculate revenue per month
    (payments || []).forEach(payment => {
      const paymentMonth = format(parseISO(payment.payment_date), 'yyyy-MM');
      const monthData = monthsInRange.find(m => m.month === paymentMonth);
      if (monthData) {
        monthData.revenue += Number(payment.amount);
      }
    });

    // Calculate occupied days per month (simplified)
    (reservationsData || []).forEach(reservation => {
      const checkIn = parseISO(reservation.check_in);
      const checkOut = parseISO(reservation.check_out);
      
      monthsInRange.forEach(monthData => {
        const monthStart = parseISO(`${monthData.month}-01`);
        const monthEnd = endOfMonth(monthStart);
        
        // Calculate overlap between reservation and month
        const overlapStart = checkIn > monthStart ? checkIn : monthStart;
        const overlapEnd = checkOut < monthEnd ? checkOut : monthEnd;
        
        if (overlapStart <= overlapEnd) {
          const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          monthData.occupiedDays += days;
        }
      });
    });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.text('Relatório Financeiro', pageWidth / 2, 20, { align: 'center' });
    
    // Date Range
    doc.setFontSize(10);
    doc.text(`Período: ${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Gerado em: ${format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, pageWidth / 2, 34, { align: 'center' });

    // Summary
    doc.setFontSize(14);
    doc.text('Resumo Atual', 14, 50);
    
    doc.setFontSize(11);
    doc.text(`Reservas Pendentes: ${pendingCount}`, 14, 60);
    doc.text(`Reservas Confirmadas: ${confirmedCount}`, 14, 67);

    // Revenue Table
    doc.setFontSize(14);
    doc.text('Receita Mensal', 14, 83);

    const revenueData = monthsInRange.map(stat => [
      stat.label,
      `R$ ${stat.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      startY: 88,
      head: [['Mês', 'Receita']],
      body: revenueData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Occupancy Table
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 130;
    
    doc.setFontSize(14);
    doc.text('Taxa de Ocupação', 14, finalY + 15);

    const occupancyData = monthsInRange.map(stat => {
      const rate = Math.min(100, Math.round((stat.occupiedDays / stat.totalDays) * 100));
      return [
        stat.label,
        `${stat.occupiedDays} dias`,
        `${stat.totalDays} dias`,
        `${rate}%`,
      ];
    });

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Mês', 'Dias Ocupados', 'Total de Dias', 'Taxa']],
      body: occupancyData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });

    // Totals
    const totalRevenue = monthsInRange.reduce((sum, stat) => sum + stat.revenue, 0);
    const totalOccupied = monthsInRange.reduce((sum, stat) => sum + stat.occupiedDays, 0);
    const totalDays = monthsInRange.reduce((sum, stat) => sum + stat.totalDays, 0);
    const avgOccupancy = totalDays > 0 ? Math.round((totalOccupied / totalDays) * 100) : 0;

    type DocWithAutoTable = jsPDF & { lastAutoTable?: { finalY?: number } };
    const finalY2 = ((doc as DocWithAutoTable).lastAutoTable?.finalY) || 200;
    
    doc.setFontSize(12);
    doc.text(`Receita Total: R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, finalY2 + 15);
    doc.text(`Taxa Média de Ocupação: ${avgOccupancy}%`, 14, finalY2 + 23);

    // Save
    doc.save(`relatorio-financeiro-${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}.pdf`);
    toast.success('Relatório exportado com sucesso!');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está o resumo das suas reservas.
          </p>
        </div>
        <ReportDateFilter onExport={handleExportPDF} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedCount}</div>
            <p className="text-xs text-muted-foreground">Próximas estadias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Receita Mensal
            </CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: Substituir gráfico por alternativa segura (ex: chart.js, nivo, victory, apexcharts) */}
            <div className="h-[250px] flex items-center justify-center text-muted-foreground border rounded-lg">
              <span>Gráfico removido por CSP. Substitua por alternativa segura.</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Taxa de Ocupação
            </CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: Substituir gráfico por alternativa segura (ex: chart.js, nivo, victory, apexcharts) */}
            <div className="h-[250px] flex items-center justify-center text-muted-foreground border rounded-lg">
              <span>Gráfico removido por CSP. Substitua por alternativa segura.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reservations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display">Próximas Reservas</CardTitle>
            <CardDescription>Chegadas e saídas agendadas</CardDescription>
          </div>
          <Link to="/admin/reservations">
            <Button variant="outline" size="sm">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingReservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nenhuma reserva agendada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {reservation.guest?.full_name || 'Hóspede não identificado'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(reservation.check_in), "dd 'de' MMM", { locale: ptBR })} - {format(parseISO(reservation.check_out), "dd 'de' MMM", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={statusColors[reservation.status]}>
                      {statusLabels[reservation.status]}
                    </Badge>
                    <span className="font-semibold text-primary">
                      R$ {Number(reservation.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}