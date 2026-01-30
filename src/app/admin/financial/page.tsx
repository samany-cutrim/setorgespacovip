import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses, useCreateExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { useAllPayments, useCreatePayment } from '@/hooks/usePayments';
import { useReservations } from '@/hooks/useReservations';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Financial() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: expenses, isLoading: loadingExpenses } = useExpenses();
  const { data: payments, isLoading: loadingPayments } = useAllPayments();
  const { data: reservations } = useReservations();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const createPayment = useCreatePayment();
  const { toast } = useToast();

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    category: 'Manutenção',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [incomeData, setIncomeData] = useState({
    reservation_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    source: 'presencial' // 'presencial' ou 'outro'
  });

  // Check for action=new param
  useEffect(() => {
    if (searchParams.get('action') === 'new' && searchParams.get('tab') === 'expenses') {
      setIsExpenseDialogOpen(true);
    }
  }, [searchParams]);

  const handleSaveIncome = async () => {
    try {
      if (!incomeData.amount) {
        toast({ title: "Insira o valor da receita", variant: "destructive" });
        return;
      }
      await createPayment.mutateAsync({
        reservation_id: incomeData.reservation_id || null,
        amount: parseFloat(incomeData.amount),
        status: 'received',
        date: incomeData.date,
        notes: incomeData.notes
      });
      toast({ title: "Receita registrada com sucesso" });
      setIsIncomeDialogOpen(false);
      setIncomeData({
        reservation_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        source: 'presencial'
      });
    } catch (error) {
      toast({ title: "Erro ao registrar receita", variant: "destructive" });
    }
  };

  const handleSaveExpense = async () => {
    try {
      await createExpense.mutateAsync({
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        date: expenseData.date,
        notes: expenseData.notes
      });
      toast({ title: "Despesa registrada com sucesso" });
      setIsExpenseDialogOpen(false);
      setExpenseData({
        description: '',
        amount: '',
        category: 'Manutenção',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      toast({ title: "Erro ao registrar despesa", variant: "destructive" });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm("Tem certeza que deseja remover esta despesa?")) {
      try {
        await deleteExpense.mutateAsync(id);
        toast({ title: "Despesa removida" });
      } catch (error) {
        toast({ title: "Erro ao remover", variant: "destructive" });
      }
    }
  };

  const totalIncome = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const balance = totalIncome - totalExpenses;

  const onOpenChangeDialog = (open: boolean) => {
    setIsExpenseDialogOpen(open);
    if (!open) {
      // Clean URL params when closing
      if (searchParams.get('action') === 'new') {
         navigate('/admin/financial', { replace: true });
      }
    }
  }

  if (loadingExpenses || loadingPayments) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financeiro</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balanço</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registro de Despesas</CardTitle>
              <Button onClick={() => setIsExpenseDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nova Despesa
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Nenhuma despesa registrada.</TableCell>
                    </TableRow>
                  )}
                  {expenses?.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="text-red-600 font-medium">-{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteExpense(expense.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Histórico de Receitas</CardTitle>
                    <Button onClick={() => setIsIncomeDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" /> Registrar Receita
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Reserva/Origem</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Observação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {payments?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Nenhuma receita registrada.</TableCell>
                                </TableRow>
                              )}
                            {payments?.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>{payment.reservation_id ? `Reserva #${payment.reservation_id.substring(0,8)}` : 'Receita Avulsa'}</TableCell>
                                    <TableCell className="text-green-600 font-medium">+{formatCurrency(payment.amount)}</TableCell>
                                    <TableCell className="text-sm text-gray-600">{payment.notes || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isExpenseDialogOpen} onOpenChange={onOpenChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
            <DialogDescription>Registre uma nova despesa do espaço.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={expenseData.description}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={expenseData.category}
                onValueChange={(value) => setExpenseData({ ...expenseData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Limpeza">Limpeza</SelectItem>
                  <SelectItem value="Contas">Contas (Água/Luz/Net)</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={expenseData.date}
                onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={expenseData.notes}
                onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveExpense}>Salvar Despesa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
