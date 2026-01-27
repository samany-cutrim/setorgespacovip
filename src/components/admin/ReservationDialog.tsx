import { useState, useEffect } from 'react';
import { useGuests } from '@/hooks/useGuests';
import { usePricingRules, calculateTotalPrice } from '@/hooks/usePricingRules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Percent, Loader2 } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Reservation, ReservationStatus, PaymentStatus } from '@/lib/types';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation?: Reservation | null;
  onSave: (data: ReservationFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface ReservationFormData {
  guest_id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_amount: number;
  discount_amount: number;
  deposit_amount: number;
  status: ReservationStatus;
  payment_status: PaymentStatus;
  notes: string | null;
}

// Helper to get initial form data
function getInitialFormData(reservation?: Reservation | null) {
  if (reservation) {
    return {
      guest_id: reservation.guest_id || '',
      num_guests: reservation.num_guests,
      total_amount: Number(reservation.total_amount),
      discount_amount: Number(reservation.discount_amount) || 0,
      deposit_amount: Number(reservation.deposit_amount) || 0,
      status: reservation.status,
      payment_status: reservation.payment_status,
      notes: reservation.notes || '',
    };
  }
  return {
    guest_id: '',
    num_guests: 1,
    total_amount: 0,
    discount_amount: 0,
    deposit_amount: 0,
    status: 'pending' as ReservationStatus,
    payment_status: 'pending' as PaymentStatus,
    notes: '',
  };
}

// Helper to get initial date range
function getInitialDateRange(reservation?: Reservation | null): DateRange | undefined {
  if (reservation) {
    return {
      from: parseISO(reservation.check_in),
      to: parseISO(reservation.check_out),
    };
  }
  return undefined;
}

export function ReservationDialog({
  open,
  onOpenChange,
  reservation,
  onSave,
  isLoading,
}: ReservationDialogProps) {
  const { data: guests = [] } = useGuests();
  const { data: pricingRules = [] } = usePricingRules();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getInitialDateRange(reservation));
  const [formData, setFormData] = useState(() => getInitialFormData(reservation));

  const calculatedPrice = dateRange?.from && dateRange?.to 
    ? calculateTotalPrice(dateRange.from, dateRange.to, pricingRules)
    : 0;

  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;

  const finalAmount = formData.total_amount - formData.discount_amount;
  const remainingAmount = finalAmount - formData.deposit_amount;

  // Handle date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // Auto-calculate price for new reservations when dates are selected
    if (!reservation && range?.from && range?.to) {
      const price = calculateTotalPrice(range.from, range.to, pricingRules);
      if (price > 0) {
        setFormData(prev => ({ ...prev, total_amount: price }));
      }
    }
  };

  // Initialize form when editing
  // This effect synchronizes local form state with the reservation prop when it changes.
  // This is a legitimate use case for setState in effects - syncing with external props.
  useEffect(() => {
    // Re-initialize when reservation changes or dialog opens
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateRange(getInitialDateRange(reservation));
    setFormData(getInitialFormData(reservation));
  }, [reservation, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dateRange?.from || !dateRange?.to || !formData.guest_id) {
      return;
    }

    await onSave({
      guest_id: formData.guest_id,
      check_in: format(dateRange.from, 'yyyy-MM-dd'),
      check_out: format(dateRange.to, 'yyyy-MM-dd'),
      num_guests: formData.num_guests,
      total_amount: formData.total_amount,
      discount_amount: formData.discount_amount,
      deposit_amount: formData.deposit_amount,
      status: formData.status,
      payment_status: formData.payment_status,
      notes: formData.notes || null,
    });
  };

  const selectedGuest = guests.find(g => g.id === formData.guest_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reservation ? 'Editar Reserva' : 'Nova Reserva'}</DialogTitle>
          <DialogDescription>
            {reservation ? 'Edite os dados da reserva' : 'Crie uma nova reserva manualmente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Selection */}
          <div className="space-y-2">
            <Label>Hóspede *</Label>
            <Select
              value={formData.guest_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, guest_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um hóspede" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.full_name} - {guest.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGuest && (
              <p className="text-sm text-muted-foreground">
                Email: {selectedGuest.email || 'Não informado'}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Período *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Selecione as datas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {nights > 0 && (
              <p className="text-sm text-muted-foreground">
                {nights} {nights === 1 ? 'diária' : 'diárias'} | Valor sugerido: R$ {calculatedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="num_guests">Número de hóspedes</Label>
            <Input
              id="num_guests"
              type="number"
              min={1}
              value={formData.num_guests}
              onChange={(e) => setFormData(prev => ({ ...prev, num_guests: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <Separator />

          {/* Pricing Section */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              Valores
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="total_amount">Valor total (R$)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.total_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_amount">Desconto (R$)</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.discount_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Valor de entrada (R$)</Label>
              <Input
                id="deposit_amount"
                type="number"
                step="0.01"
                min={0}
                value={formData.deposit_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-sm text-muted-foreground">
                Valor que o cliente paga para confirmar a reserva
              </p>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor total</span>
                <span>R$ {formData.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {formData.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Desconto</span>
                  <span>- R$ {formData.discount_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Valor final</span>
                <span className="text-primary">R$ {finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {formData.deposit_amount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrada</span>
                    <span>R$ {formData.deposit_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Restante</span>
                    <span className="text-warning">R$ {remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status da reserva</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ReservationStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status do pagamento</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value: PaymentStatus) => setFormData(prev => ({ ...prev, payment_status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Anotações sobre a reserva..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !dateRange?.from || !dateRange?.to || !formData.guest_id}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reservation ? 'Salvar alterações' : 'Criar reserva'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}