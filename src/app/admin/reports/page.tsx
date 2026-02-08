import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReservations } from '@/hooks/useReservations';
import { useAllPayments } from '@/hooks/usePayments';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency } from '@/lib/utils';
import { Download, BarChart3 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from "react-day-picker";

export default function Reports() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const { data: reservations } = useReservations();
  const { data: payments } = useAllPayments();
  const { data: expenses } = useExpenses();

  const filteredReservations = useMemo(() => {
    if (!reservations || !date?.from || !date?.to) return [];
    return reservations.filter(res => {
      const checkIn = parseISO(res.check_in);
      return isWithinInterval(checkIn, { start: date.from!, end: date.to! });
    });
  }, [reservations, date]);

  const filteredPayments = useMemo(() => {
    if (!payments || !date?.from || !date?.to) return [];
    return payments.filter(payment => {
      const paymentDate = parseISO(payment.created_at);
      return isWithinInterval(paymentDate, { start: date.from!, end: date.to! });
    });
  }, [payments, date]);

  const filteredExpenses = useMemo(() => {
    if (!expenses || !date?.from || !date?.to) return [];
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, { start: date.from!, end: date.to! });
    });
  }, [expenses, date]);

  const totalIncome = filteredPayments.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const balance = totalIncome - totalExpenses;
  const avgReservationValue = filteredReservations.length > 0 ? totalIncome / filteredReservations.length : 0;

  const handleGenerateReport = () => {
    if (!date?.from || !date?.to) return;
    
    const reportData = {
      period: `${format(date.from, 'dd/MM/yyyy')} a ${format(date.to, 'dd/MM/yyyy')}`,
      reservations: filteredReservations.length,
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      balance: balance,
      avgReservationValue: avgReservationValue,
      generatedAt: new Date().toLocaleString('pt-BR')
    };

    // Criar CSV
    const csv = `RELATÓRIO DE FATURAMENTO
Período: ${reportData.period}
Gerado em: ${reportData.generatedAt}

RESUMO EXECUTIVO
Número de Reservas,${reportData.reservations}
Receita Total,"R$ ${formatCurrency(reportData.totalIncome)}"
Despesas Total,"R$ ${formatCurrency(reportData.totalExpenses)}"
Saldo Líquido,"R$ ${formatCurrency(reportData.balance)}"
Valor Médio por Reserva,"R$ ${formatCurrency(reportData.avgReservationValue)}"

DETALHES DE RECEITAS
Data,Reserva,Valor,Status
${filteredPayments.map(p => `${format(parseISO(p.created_at), 'dd/MM/yyyy')},${p.reservation_id ? `#${p.reservation_id.substring(0, 8)}` : 'Avulsa'},"R$ ${formatCurrency(p.amount)}",${p.status}`).join('\n')}

DETALHES DE DESPESAS
Data,Descrição,Categoria,Valor
${filteredExpenses.map(e => `${format(parseISO(e.date), 'dd/MM/yyyy')},${e.description},${e.category},"R$ ${formatCurrency(e.amount)}"`).join('\n')}`;

    // Download CSV
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute('download', `relatorio_${format(date.from, 'ddMMyyyy')}_a_${format(date.to, 'ddMMyyyy')}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Período</label>
            <div className="flex gap-2 mt-1">
              <input
                type="date"
                value={date?.from ? format(date.from, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDate({ from: parseISO(e.target.value), to: date?.to || new Date() })}
                className="px-3 py-1 border rounded-md"
                aria-label="Data inicial"
              />
              <input
                type="date"
                value={date?.to ? format(date.to, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDate({ from: date?.from || new Date(), to: parseISO(e.target.value) })}
                className="px-3 py-1 border rounded-md"
                aria-label="Data final"
              />
            </div>
          </div>
          <Button onClick={handleGenerateReport} className="gap-2 mt-6">
            <Download className="h-4 w-4" />
            Gerar Relatório (CSV)
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
          <TabsTrigger value="payments">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Reservas</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredReservations.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className={`p-4 ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
                  <p className="text-sm text-muted-foreground">Saldo Líquido</p>
                  <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(avgReservationValue)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle>Reservas do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Hóspede</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhuma reserva no período
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReservations.map((res) => (
                      <TableRow key={res.id}>
                        <TableCell>{format(parseISO(res.check_in), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{res.guest?.full_name || 'Desconhecido'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {res.status === 'confirmed' ? 'Confirmada' : 
                             res.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(res.total_amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Receitas do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Reserva</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhuma receita no período
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{format(parseISO(payment.created_at), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{payment.reservation_id ? `#${payment.reservation_id.substring(0, 8)}` : 'Avulsa'}</TableCell>
                        <TableCell className="capitalize">{payment.status}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">+{formatCurrency(payment.amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Despesas do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhuma despesa no período
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{format(parseISO(expense.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">-{formatCurrency(expense.amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
