import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DollarSign, Users, BedDouble, BarChart, PlusCircle, Wallet, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  // Fetch real stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      // 1. Total Revenue (Sum of all payments)
      const { data: payments } = await supabase
        .from('payments')
        .select('amount');
        
      const totalRevenue = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      // 2. Total Guests
      const { count: guestsCount } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true });

      // 3. Total Reservations
      const { count: reservationsCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });

      // 4. Occupancy Rate (Simple calculation: confirmed reservations / 30 days * 100 for simplicity or just 0 for now as it's complex)
      // Let's keep it 0 or calc based on active reservations for current month if possible.
      // For now, let's just return 0 to "zero" it as requested if no data.
      
      return {
        revenue: totalRevenue,
        guests: guestsCount || 0,
        reservations: reservationsCount || 0,
        occupancy: 0 // Placeholder until advanced logic is valid
      };
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +0% do último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hóspedes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.guests || 0}</div>
            <p className="text-xs text-muted-foreground">
              +0% do último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reservations || 0}</div>
            <p className="text-xs text-muted-foreground">
              +0% do último mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.occupancy || 0}%</div>
            <p className="text-xs text-muted-foreground">
              +0% da última semana
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/reservations?action=new">
            <Button className="h-24 w-40 flex flex-col gap-2" variant="outline">
              <PlusCircle className="h-8 w-8 text-primary" />
              <span>Nova Reserva</span>
            </Button>
          </Link>
          
          <Link to="/admin/guests?action=new">
            <Button className="h-24 w-40 flex flex-col gap-2" variant="outline">
              <UserPlus className="h-8 w-8 text-blue-500" />
              <span>Novo Hóspede</span>
            </Button>
          </Link>

          <Link to="/admin/financial?tab=expenses&action=new">
            <Button className="h-24 w-40 flex flex-col gap-2" variant="outline">
              <Wallet className="h-8 w-8 text-red-500" />
              <span>Registrar Despesa</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
