import { useAuth } from '@/hooks/useAuth';
import { useReservations, useUpcomingReservations } from '@/hooks/useReservations';
import { useMonthlyRevenue } from '@/hooks/usePayments';
import { useDashboardStats } from '@/hooks/useDashboardStats';
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
  FileDown,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const { data: reservations = [] } = useReservations();
  const { data: upcomingReservations = [] } = useUpcomingReservations();
  const { data: dashboardStats = [] } = useDashboardStats();
  
  const now = new Date();
  const { data: monthlyRevenue = 0 } = useMonthlyRevenue(now.getFullYear(), now.getMonth());

  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.text('Relatório Financeiro', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, pageWidth / 2, 28, { align: 'center' });

    // Summary
    doc.setFontSize(14);
    doc.text('Resumo Atual', 14, 45);
    
    doc.setFontSize(11);
    doc.text(`Reservas Pendentes: ${pendingCount}`, 14, 55);
    doc.text(`Reservas Confirmadas: ${confirmedCount}`, 14, 62);
    doc.text(`Receita do Mês: R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 69);

    // Revenue Table
    doc.setFontSize(14);
    doc.text('Receita Mensal (Últimos 6 meses)', 14, 85);

    const revenueData = dashboardStats.map(stat => [
      stat.monthLabel,
      `R$ ${stat.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      startY: 90,
      head: [['Mês', 'Receita']],
      body: revenueData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Occupancy Table
    const finalY = (doc as any).lastAutoTable.finalY || 130;
    
    doc.setFontSize(14);
    doc.text('Taxa de Ocupação (Últimos 6 meses)', 14, finalY + 15);

    const occupancyData = dashboardStats.map(stat => [
      stat.monthLabel,
      `${stat.occupiedDays} dias`,
      `${stat.totalDays} dias`,
      `${stat.occupancyRate}%`,
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Mês', 'Dias Ocupados', 'Total de Dias', 'Taxa']],
      body: occupancyData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });

    // Totals
    const totalRevenue = dashboardStats.reduce((sum, stat) => sum + stat.revenue, 0);
    const avgOccupancy = dashboardStats.length > 0 
      ? Math.round(dashboardStats.reduce((sum, stat) => sum + stat.occupancyRate, 0) / dashboardStats.length)
      : 0;

    const finalY2 = (doc as any).lastAutoTable.finalY || 200;
    
    doc.setFontSize(12);
    doc.text(`Receita Total (6 meses): R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, finalY2 + 15);
    doc.text(`Taxa Média de Ocupação: ${avgOccupancy}%`, 14, finalY2 + 23);

    // Save
    doc.save(`relatorio-financeiro-${format(now, 'yyyy-MM-dd')}.pdf`);
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
        <Button onClick={handleExportPDF} variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
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
            <ChartContainer config={revenueChartConfig} className="h-[250px]">
              <BarChart data={dashboardStats} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis 
                  dataKey="monthLabel" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
                    />
                  } 
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
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
            <ChartContainer config={occupancyChartConfig} className="h-[250px]">
              <LineChart data={dashboardStats} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis 
                  dataKey="monthLabel" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                  className="text-xs"
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => [`${value}%`, 'Ocupação']}
                    />
                  } 
                />
                <Line 
                  type="monotone" 
                  dataKey="occupancyRate" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
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