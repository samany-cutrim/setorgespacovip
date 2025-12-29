import { useState } from 'react';
import { useReservations, useUpdateReservation } from '@/hooks/useReservations';
import { useAllPayments, useCreatePayment, useDeletePayment, useMonthlyRevenue } from '@/hooks/usePayments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Plus, Trash2, TrendingUp, Loader2 } from 'lucide-react';
import { format, parseISO, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminFinance() {
  const { toast } = useToast();
  const { data: reservations = [] } = useReservations();
  const { data: payments = [], isLoading } = useAllPayments();
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();
  const updateReservation = useUpdateReservation();

  const now = new Date();
  const { data: currentMonthRevenue = 0 } = useMonthlyRevenue(now.getFullYear(), now.getMonth());
  const lastMonth = subMonths(now, 1);
  const { data: lastMonthRevenue = 0 } = useMonthlyRevenue(lastMonth.getFullYear(), lastMonth.getMonth());

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    reservation_id: '',
    amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: '',
    notes: '',
  });

  const pendingReservations = reservations.filter(
    r => r.payment_status !== 'paid' && r.status !== 'cancelled'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reservation_id || !formData.amount) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      });
      return;
    }

    try {
      await createPayment.mutateAsync({
        reservation_id: formData.reservation_id,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method || null,
        notes: formData.notes || null,
      });

      // Check if reservation is fully paid
      const reservation = reservations.find(r => r.id === formData.reservation_id);
      if (reservation) {
        const existingPayments = payments.filter(p => p.reservation_id === formData.reservation_id);
        const totalPaid = existingPayments.reduce((sum, p) => sum + Number(p.amount), 0) + parseFloat(formData.amount);
        
        if (totalPaid >= Number(reservation.total_amount)) {
          await updateReservation.mutateAsync({ id: formData.reservation_id, payment_status: 'paid' });
        } else if (totalPaid > 0) {
          await updateReservation.mutateAsync({ id: formData.reservation_id, payment_status: 'partial' });
        }
      }

      toast({ title: 'Pagamento registrado' });
      setIsDialogOpen(false);
      setFormData({
        reservation_id: '',
        amount: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: '',
        notes: '',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar pagamento',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePayment.mutateAsync(id);
      toast({ title: 'Pagamento excluído' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir pagamento',
      });
    }
  };

  const revenueChange = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle de pagamentos e receitas
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Pagamento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Este Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {currentMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mês Anterior</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {lastMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(lastMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente de Pagamento</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReservations.length}</div>
            <p className="text-xs text-muted-foreground">reservas aguardando</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>Todos os pagamentos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Nenhum pagamento registrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Hóspede</TableHead>
                        <TableHead>Reserva</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(parseISO(payment.payment_date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            {payment.reservation?.guest?.full_name || '-'}
                          </TableCell>
                          <TableCell>
                            {payment.reservation ? (
                              <span className="text-sm text-muted-foreground">
                                {format(parseISO(payment.reservation.check_in), 'dd/MM')} - {format(parseISO(payment.reservation.check_out), 'dd/MM')}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{payment.payment_method || '-'}</TableCell>
                          <TableCell className="font-medium text-success">
                            R$ {Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reservas Pendentes</CardTitle>
              <CardDescription>Aguardando pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Nenhum pagamento pendente</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hóspede</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">
                            {reservation.guest?.full_name || '-'}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(reservation.check_in), 'dd/MM')} - {format(parseISO(reservation.check_out), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            R$ {Number(reservation.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              reservation.payment_status === 'partial' 
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-warning/10 text-warning border-warning/20'
                            }>
                              {reservation.payment_status === 'partial' ? 'Parcial' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  reservation_id: reservation.id,
                                  amount: String(reservation.total_amount),
                                  payment_date: format(new Date(), 'yyyy-MM-dd'),
                                  payment_method: '',
                                  notes: '',
                                });
                                setIsDialogOpen(true);
                              }}
                            >
                              Registrar Pagamento
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>Adicione um novo pagamento</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reservation">Reserva *</Label>
              <Select
                value={formData.reservation_id}
                onValueChange={(value) => {
                  const reservation = reservations.find(r => r.id === value);
                  setFormData(prev => ({
                    ...prev,
                    reservation_id: value,
                    amount: reservation ? String(reservation.total_amount) : prev.amount,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma reserva" />
                </SelectTrigger>
                <SelectContent>
                  {pendingReservations.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.guest?.full_name} - {format(parseISO(r.check_in), 'dd/MM')} a {format(parseISO(r.check_out), 'dd/MM')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_date">Data do Pagamento</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
