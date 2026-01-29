import { useState } from 'react';
import { useReservationsByMonth, useUpdateReservation } from '@/hooks/useReservations';
import { useBlockedDates, useCreateBlockedDate, useDeleteBlockedDate } from '@/hooks/useBlockedDates';
import { Reservation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Plus, X, CalendarDays } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
  getDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

const statusColors = {
  pending: 'bg-warning text-warning-foreground',
  confirmed: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
  completed: 'bg-muted text-muted-foreground',
};

export default function AdminCalendar() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [blockRange, setBlockRange] = useState<DateRange | undefined>();
  const [blockReason, setBlockReason] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const { data: reservations = [] } = useReservationsByMonth(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );
  const { data: blockedDates = [] } = useBlockedDates();
  const createBlockedDate = useCreateBlockedDate();
  const deleteBlockedDate = useDeleteBlockedDate();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day offset
  const firstDayOfWeek = getDay(monthStart);
  const prefixDays = Array(firstDayOfWeek).fill(null);

  const getReservationForDay = (date: Date) => {
    return reservations.find(r => {
      const checkIn = parseISO(r.check_in);
      const checkOut = parseISO(r.check_out);
      return isWithinInterval(date, { start: checkIn, end: checkOut }) ||
        isSameDay(date, checkIn) || isSameDay(date, checkOut);
    });
  };

  const getBlockedDateForDay = (date: Date) => {
    return blockedDates.find(b => {
      const start = parseISO(b.start_date);
      const end = parseISO(b.end_date);
      return isWithinInterval(date, { start, end }) ||
        isSameDay(date, start) || isSameDay(date, end);
    });
  };

  const handleBlockDates = async () => {
    if (!blockRange?.from || !blockRange?.to) {
      toast({
        variant: 'destructive',
        title: 'Selecione as datas',
      });
      return;
    }

    try {
      await createBlockedDate.mutateAsync({
        start_date: format(blockRange.from, 'yyyy-MM-dd'),
        end_date: format(blockRange.to, 'yyyy-MM-dd'),
        reason: blockReason || null,
      });
      toast({ title: 'Datas bloqueadas' });
      setIsBlockDialogOpen(false);
      setBlockRange(undefined);
      setBlockReason('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao bloquear datas',
      });
    }
  };

  const handleUnblockDate = async (id: string) => {
    try {
      await deleteBlockedDate.mutateAsync(id);
      toast({ title: 'Bloqueio removido' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover bloqueio',
      });
    }
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground">
            Visualize reservas e bloqueie datas
          </p>
        </div>
        <Button onClick={() => setIsBlockDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Bloquear Datas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-display text-xl font-semibold capitalize">
                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </h2>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span>Pendente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span>Confirmada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                <span>Bloqueado</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {prefixDays.map((_, i) => (
              <div key={`prefix-${i}`} className="min-h-24 p-2" />
            ))}
            {daysInMonth.map((date) => {
              const reservation = getReservationForDay(date);
              const blocked = getBlockedDateForDay(date);
              const isCheckIn = reservation && isSameDay(parseISO(reservation.check_in), date);
              const isCheckOut = reservation && isSameDay(parseISO(reservation.check_out), date);

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-24 rounded-lg border p-2 transition-colors ${
                    blocked ? 'bg-muted/50' : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      !isSameMonth(date, currentMonth) ? 'text-muted-foreground' : ''
                    }`}>
                      {format(date, 'd')}
                    </span>
                    {blocked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleUnblockDate(blocked.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {reservation && !blocked && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`mt-1 w-full rounded px-1 py-0.5 text-left text-xs ${statusColors[reservation.status]}`}
                        >
                          {isCheckIn && 'Entrada: '}
                          {isCheckOut && 'Saída: '}
                          {reservation.guest?.full_name?.split(' ')[0] || 'Reserva'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-2">
                          <h4 className="font-medium">{reservation.guest?.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{reservation.guest?.phone}</p>
                          <div className="text-sm">
                            <p>Check-in: {format(parseISO(reservation.check_in), 'dd/MM/yyyy')}</p>
                            <p>Check-out: {format(parseISO(reservation.check_out), 'dd/MM/yyyy')}</p>
                          </div>
                          <p className="font-medium text-primary">
                            R$ {Number(reservation.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  {blocked && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {blocked.reason || 'Bloqueado'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bloquear Datas</DialogTitle>
            <DialogDescription>
              Selecione o período para bloquear (manutenção, uso pessoal, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Calendar
              mode="range"
              selected={blockRange}
              onSelect={setBlockRange}
              numberOfMonths={1}
              disabled={(date) => date < new Date()}
              locale={ptBR}
              className="pointer-events-auto rounded-md border"
            />
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Input
                id="reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Manutenção, Uso pessoal..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBlockDates}>Bloquear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
