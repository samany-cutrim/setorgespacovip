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

    // Buscar pagamentos via API REST
    const paymentsRes = await fetch(`/api/payments?start=${startStr}&end=${endStr}`);
    const payments = paymentsRes.ok ? await paymentsRes.json() : [];

    // Buscar reservas via API REST
    const reservationsRes = await fetch(`/api/reservations?start=${startStr}&end=${endStr}&status=confirmed,completed`);
    const reservations = reservationsRes.ok ? await reservationsRes.json() : [];

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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-base text-gray-600">
            Bem-vindo de volta! Aqui está o resumo das suas reservas.
          </p>
        </div>
        <ReportDateFilter onExport={handleExportPDF} />
      </div>

      {/* Stats Cards - Modern Design */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Reservas Pendentes</CardTitle>
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 mb-1">{pendingCount}</div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Reservas Confirmadas</CardTitle>
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 mb-1">{confirmedCount}</div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              Próximas estadias
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-teal-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Receita do Mês</CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-gray-600">
              {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Modern Placeholders */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              Receita Mensal
            </CardTitle>
            <CardDescription className="text-base">Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Modern placeholder for chart */}
            <div className="h-[280px] flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border-2 border-dashed border-gray-200">
              <DollarSign className="h-12 w-12 text-primary/40 mb-3" />
              <span className="text-sm font-medium text-gray-500">Gráfico de Receita</span>
              <span className="text-xs text-gray-400 mt-1">Dados dos últimos 6 meses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              Taxa de Ocupação
            </CardTitle>
            <CardDescription className="text-base">Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Modern placeholder for chart */}
            <div className="h-[280px] flex flex-col items-center justify-center bg-gradient-to-br from-accent/5 to-success/5 rounded-2xl border-2 border-dashed border-gray-200">
              <TrendingUp className="h-12 w-12 text-accent/40 mb-3" />
              <span className="text-sm font-medium text-gray-500">Gráfico de Ocupação</span>
              <span className="text-xs text-gray-400 mt-1">Dados dos últimos 6 meses</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reservations - Enhanced Design */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-1">Próximas Reservas</CardTitle>
            <CardDescription className="text-base">Chegadas e saídas agendadas</CardDescription>
          </div>
          <Link to="/admin/reservations">
            <Button variant="outline" size="sm" className="rounded-xl font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-6">
          {upcomingReservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <CalendarDays className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">Nenhuma reserva agendada</p>
              <p className="text-sm text-gray-500">As próximas reservas aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white"
                >
                  <div className="space-y-2">
                    <p className="font-semibold text-lg text-gray-900">
                      {reservation.guest?.full_name || 'Hóspede não identificado'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {format(parseISO(reservation.check_in), "dd 'de' MMM", { locale: ptBR })} - {format(parseISO(reservation.check_out), "dd 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={`${statusColors[reservation.status]} px-3 py-1 text-xs font-medium`}>
                      {statusLabels[reservation.status]}
                    </Badge>
                    <span className="text-xl font-bold text-primary">
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