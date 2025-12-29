import { useAuth } from '@/hooks/useAuth';
import { useReservations, useUpcomingReservations } from '@/hooks/useReservations';
import { useMonthlyRevenue } from '@/hooks/usePayments';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useGuests } from '@/hooks/useGuests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, 
  Users, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

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
  const { data: guests = [] } = useGuests();
  const { data: dashboardStats = [] } = useDashboardStats();
  
  const now = new Date();
  const { data: monthlyRevenue = 0 } = useMonthlyRevenue(now.getFullYear(), now.getMonth());

  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está o resumo das suas reservas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Hóspedes Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guests.length}</div>
            <p className="text-xs text-muted-foreground">Total de clientes</p>
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