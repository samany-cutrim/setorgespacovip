import { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBlockedDates } from '@/hooks/useBlockedDates';
import { useCreateReservation } from '@/hooks/useReservations';
import { useCreateGuest } from '@/hooks/useGuests';
import { useToast } from '@/hooks/use-toast';
import { addDays, isBefore, startOfToday, isSameDay, format } from 'date-fns';
import { DateRange } from "react-day-picker";
import { ptBR } from 'date-fns/locale';

export default function ClientArea() {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    notes: '',
  });

  // Hooks
  const { data: blockedDates, isLoading: isLoadingBlocked } = useBlockedDates();
  const createReservation = useCreateReservation();
  const createGuest = useCreateGuest();
  const { toast } = useToast();

  // Determine disabled days (past + blocked)
  const disabledDays = useMemo(() => {
    const today = startOfToday();
    const days: any[] = [{ before: today }]; // Disable past days

    if (blockedDates) {
      blockedDates.forEach((blocked) => {
        // Adjust strings to Dates
        const start = new Date(blocked.start_date);
        // blocked.end_date might be inclusive or exclusive depending on backend. 
        // Usually safe to assume inclusive for "blocked" visually.
        const end = new Date(blocked.end_date);
        
        // Add one day to end if the calendar treats 'to' as exclusive, but usually it's inclusive.
        // Let's assume inclusive range for DateRange type in DayPicker
        days.push({ from: start, to: end });
      });
    }
    return days;
  }, [blockedDates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date?.from || !date?.to) {
      toast({
        title: "Selecione uma data",
        description: "Por favor, escolha uma data disponível no calendário.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Create Guest first
      // In a real scenario, you might search for an existing guest by email.
      // For now, we attempt to create one. If your API handles upsert, great.
      const newGuest = await createGuest.mutateAsync({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        document: null,
        notes: null
      });

      if (!newGuest?.id) throw new Error("Falha ao criar hóspede");

      // 2. Create Reservation
      // Defaulting to 1 night for an event space usually means just the date involved.
      await createReservation.mutateAsync({
        guest_id: newGuest.id, 
        check_in: date.from!.toISOString().split('T')[0],
        check_out: date.to!.toISOString().split('T')[0], 
        num_guests: Number(formData.guests),
        total_amount: 0, // Placeholder
        deposit_amount: 0,
        discount_amount: 0,
        status: 'pending',
        payment_status: 'pending',
        notes: formData.notes,
      });

      toast({
        title: "Solicitação enviada!",
        description: "Entraremos em contato em breve para confirmar sua reserva.",
      });

      // Reset
      setFormData({ name: '', email: '', phone: '', guests: 1, notes: '' });
      setDate(undefined);

    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao processar sua solicitação. Verifique se o email já está cadastrado ou tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-2">Área do Cliente</h1>
      <p className="text-center text-muted-foreground mb-10">
        Verifique a disponibilidade e solicite sua reserva.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <Card className="flex flex-col items-center">
          <CardHeader>
            <CardTitle>Disponibilidade</CardTitle>
            <CardDescription>Datas em cinza estão indisponíveis.</CardDescription>
          </CardHeader>
          <CardContent>
             <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              disabled={disabledDays}
              locale={ptBR}
              className="rounded-md border shadow"
            />
            {date?.from && (
                <p className="mt-4 text-center text-sm font-medium">
                    Per�odo: {format(date.from!, 'dd/MM/yyyy')} {date.to ? ' - ' + format(date.to, 'dd/MM/yyyy') : ''}
                </p>
            )}
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Reserva</CardTitle>
            <CardDescription>Preencha seus dados para receber um orçamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Seu nome"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(99) 99999-9999"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="guests">Número de Convidados</Label>
                <Input
                  id="guests"
                  name="guests"
                  type="number"
                  min="1"
                  required
                  value={formData.guests}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Detalhes do evento..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

                <Button type="submit" className="w-full" disabled={createReservation.isPending || createGuest.isPending}>
                    {createReservation.isPending || createGuest.isPending ? 'Enviando...' : 'Solicitar Reserva'}
                </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}







