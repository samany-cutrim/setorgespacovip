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
import { startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from "react-router-dom";
import { DateRange } from "react-day-picker";

export default function Index() {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    notes: '',
  });

  const { data: blockedDates } = useBlockedDates();
  const createReservation = useCreateReservation();
  const createGuest = useCreateGuest();
  const { toast } = useToast();

  const getBrazilianHolidays = (year: number) => {
    const easter = (() => {
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
      const day = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(year, month, day);
    })();

    const addDays = (date: Date, days: number) => {
      const d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    };

    return [
      new Date(year, 0, 1),   // Confraternização Universal
      addDays(easter, -48),  // Carnaval (segunda)
      addDays(easter, -47),  // Carnaval (terça)
      addDays(easter, -2),   // Paixão de Cristo
      new Date(year, 3, 21), // Tiradentes
      new Date(year, 4, 1),  // Dia do Trabalho
      addDays(easter, 60),   // Corpus Christi
      new Date(year, 8, 7),  // Independência
      new Date(year, 9, 12), // Nossa Senhora Aparecida
      new Date(year, 10, 2), // Finados
      new Date(year, 10, 15),// Proclamação da República
      new Date(year, 11, 25) // Natal
    ];
  };

  const holidayDates = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [...getBrazilianHolidays(currentYear), ...getBrazilianHolidays(currentYear + 1)];
  }, []);

  const disabledDays = useMemo(() => {
    const today = startOfToday();
    const days: any[] = [{ before: today }];

    if (blockedDates) {
      blockedDates.forEach((blocked) => {
        const start = new Date(blocked.start_date);
        const end = new Date(blocked.end_date);
        days.push({ from: start, to: end });
      });
    }
    return days;
  }, [blockedDates]);

  const reservedDates = useMemo(() => {
    if (!blockedDates) return [];
    const dates: Date[] = [];
    blockedDates.forEach((blocked) => {
      const start = new Date(blocked.start_date);
      const end = new Date(blocked.end_date);
      const current = new Date(start);
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });
    return dates;
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
        description: "Por favor, escolha um período disponível no calendário.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create guest
      const newGuest = await createGuest.mutateAsync({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        document: null,
        notes: null
      });

      if (!newGuest?.id) throw new Error("Falha ao criar hóspede");

      // Create reservation
      await createReservation.mutateAsync({
        guest_id: newGuest.id,
        check_in: date.from.toISOString().split('T')[0],
        check_out: date.to.toISOString().split('T')[0],
        num_guests: Number(formData.guests),
        total_amount: 0, 
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

      setFormData({ name: '', email: '', phone: '', guests: 1, notes: '' });
      setDate(undefined);

    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao processar sua solicitação. Verifique os dados ou tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Setor G Espaço VIP</h1>
        <nav className="flex gap-4">
          <Link to="/client-area">
            <Button variant="secondary">Área do Cliente</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Admin Login</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-cover bg-center bg-no-repeat relative bg-[url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2698&auto=format&fit=crop')]">
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="container relative px-4 md:px-6 mx-auto text-center text-white">
             <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4">
                Bem-vindo ao Setor G Espaço VIP
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl mb-8">
                O lugar perfeito para seus eventos e confraternizações. Verifique a disponibilidade abaixo e reserve sua data.
              </p>
          </div>
        </section>
        <div className="container mx-auto py-10 px-4 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar Section */}
            <Card className="flex flex-col items-center shadow-xl border-t-4 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">Disponibilidade</CardTitle>
                <CardDescription>Selecione o período de check-in e check-out. Datas em cinza estão indisponíveis.</CardDescription>
              </CardHeader>
              <CardContent className="w-full p-4">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={setDate}
                  disabled={disabledDays}
                  locale={ptBR}
                  weekStartsOn={1}
                  numberOfMonths={1}
                  formatters={{
                    formatWeekdayName: (day) =>
                      day.toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase(),
                  }}
                  modifiers={{ 
                    holiday: holidayDates,
                    reserved: reservedDates
                  }}
                  modifiersClassNames={{
                    holiday: "bg-red-500 text-white",
                    reserved: "bg-gray-400 text-gray-700 cursor-not-allowed",
                  }}
                />
                {!date?.from && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Clique no dia de entrada e depois no dia de saída.
                  </p>
                )}
                {date?.from && date?.to && (
                  <p className="mt-4 text-center text-lg font-medium text-primary">
                    Check-in: {date.from.toLocaleDateString('pt-BR')} &nbsp;•&nbsp; Check-out: {date.to.toLocaleDateString('pt-BR')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Form Section */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Solicitar Reserva</CardTitle>
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

                    <Button type="submit" size="lg" className="w-full text-lg" disabled={createReservation.isPending || createGuest.isPending}>
                        {createReservation.isPending || createGuest.isPending ? 'Enviando...' : 'Solicitar Reserva'}
                    </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="container mx-auto py-10 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Avaliação no Google</CardTitle>
                <CardDescription>Veja o que nossos clientes dizem.</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="https://share.google/MIl5tQMGF5wfBTJ3b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  Acessar avaliações
                </a>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Instagram</CardTitle>
                <CardDescription>Acompanhe novidades e eventos.</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="https://www.instagram.com/setorgespaco_vip/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  @setorgespaco_vip
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-6 px-6 text-center mt-auto">
        <p>&copy; 2026 Setor G Espaço VIP. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
