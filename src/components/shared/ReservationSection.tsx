
import { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBlockedDates } from '@/hooks/useBlockedDates';
import { useCreateReservationWithGuest } from '@/hooks/useReservations';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneForWhatsApp, generateWhatsAppLink } from '@/lib/whatsapp';
import { startOfToday, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { CalendarDays, Info } from 'lucide-react';

// Helper function to calculate Sao Paulo/SP official holidays
const getSaoPauloHolidays = (year: number) => {
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
    addDays(easter, -2),   // Paixão de Cristo
    new Date(year, 3, 21), // Tiradentes
    new Date(year, 4, 1),  // Dia do Trabalho
    new Date(year, 0, 25), // Aniversário de São Paulo (municipal)
    new Date(year, 6, 9),  // Revolução Constitucionalista (estadual)
    addDays(easter, 60),   // Corpus Christi
    new Date(year, 8, 7),  // Independência
    new Date(year, 9, 12), // Nossa Senhora Aparecida
    new Date(year, 10, 2), // Finados
    new Date(year, 10, 20),// Consciência Negra (municipal)
    new Date(year, 10, 15),// Proclamação da República
    new Date(year, 11, 25) // Natal
  ];
};

export default function ReservationSection() {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isPixOpen, setIsPixOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    notes: '',
  });

  const { data: blockedDates } = useBlockedDates();
  const createReservationWithGuest = useCreateReservationWithGuest();
  const { toast } = useToast();
  const pixCopyPasteCode =
    '00020126580014BR.GOV.BCB.PIX01369f3c442f-4aa5-49f6-acf6-181e91abd0cd5204000053039865802BR5923Rosilena Santana Cutrim6009SAO PAULO62140510z2qdiRrSOO63047385';
  const whatsappNumber = '5511954351722';
  const whatsappLink = whatsappMessage
    ? generateWhatsAppLink(whatsappNumber, whatsappMessage)
    : `https://wa.me/${formatPhoneForWhatsApp(whatsappNumber)}`;

  const holidayDates = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [...getSaoPauloHolidays(currentYear), ...getSaoPauloHolidays(currentYear + 1)];
  }, []);

  const disabledDays = useMemo(() => {
    const today = startOfToday();
    const days: any[] = [{ before: today }];

    if (blockedDates) {
      blockedDates.forEach((blocked) => {
        const start = new Date(blocked.start_date);
        const end = new Date(blocked.end_date);
        // Adjust for timezone offset
        start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
        end.setMinutes(end.getMinutes() + end.getTimezoneOffset());
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
        title: "Selecione um período",
        description: "Por favor, escolha um período de check-in e check-out no calendário.",
        variant: "destructive",
      });
      return;
    }
    
    if(!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome, email e telefone.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReservationWithGuest.mutateAsync({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        document: null,
        guest_notes: null,
        check_in: format(date.from, "yyyy-MM-dd"),
        check_out: format(date.to, "yyyy-MM-dd"),
        num_guests: Number(formData.guests),
        total_amount: 0,
        deposit_amount: 0,
        discount_amount: 0,
        status: 'pending',
        payment_status: 'pending',
        reservation_notes: formData.notes,
      });

      toast({
        title: "Solicitação de reserva enviada!",
        description: "Sua solicitação foi recebida. Entraremos em contato em breve para confirmar.",
      });

      const submittedMessage = `Olá! Seguem os dados da minha solicitação de reserva (sinal já pago):

Nome: ${formData.name}
Email: ${formData.email}
WhatsApp: ${formData.phone}
Período: ${format(date.from, 'dd/MM/yyyy')} a ${format(date.to, 'dd/MM/yyyy')}
Convidados: ${formData.guests}
Observações: ${formData.notes || 'Sem observações'}

O pagamento do sinal já foi realizado.

Se precisar de mais alguma informação, fico à disposição.`;
      setWhatsappMessage(submittedMessage);
      setFormData({ name: '', email: '', phone: '', guests: 1, notes: '' });
      setDate(undefined);
      setIsPixOpen(true);

    } catch (error) {
      console.error("Reservation Error:", error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Ocorreu um problema ao processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 -mt-20 relative z-10">
      <Dialog open={isPixOpen} onOpenChange={setIsPixOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pagamento do sinal via Pix</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code ou use o codigo copia e cola para pagar o sinal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 p-5 text-white shadow-lg">
              <p className="text-lg font-semibold">Use o QR Code do Pix para pagar</p>
              <p className="text-sm text-white/80">
                Abra o app do seu banco, escaneie a imagem ou cole o codigo abaixo.
              </p>
              <div className="mt-4 flex justify-center">
                <img
                  src="/pix-qrcode.png"
                  alt="QR Code Pix"
                  className="h-40 w-40 rounded-xl bg-white p-2"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Codigo Pix (copia e cola)</Label>
              <Textarea readOnly value={pixCopyPasteCode} className="min-h-[90px]" />
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  className="w-full whitespace-normal"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(pixCopyPasteCode);
                      toast({ title: 'Codigo Pix copiado!' });
                    } catch {
                      toast({ title: 'Nao foi possivel copiar', variant: 'destructive' });
                    }
                  }}
                >
                  Copiar codigo Pix
                </Button>
                <Button
                  type="button"
                  className="w-full whitespace-normal"
                  onClick={async () => {
                    window.open(whatsappLink, '_blank');
                  }}
                >
                  Enviar dados no WhatsApp
                </Button>
              </div>
            </div>

            <div className="grid gap-2 rounded-2xl border border-border bg-muted/40 p-4 text-sm md:col-span-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome</span>
                <span className="font-medium">Rosilena Santana Cutrim</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPF</span>
                <span className="font-medium">•••.062.628-••</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Banco</span>
                <span className="font-medium">260 - Nu Pagamentos S.A.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Identificador</span>
                <span className="font-medium">z2qdiRrSOO</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <Card className="shadow-2xl rounded-2xl overflow-hidden border-t-4 border-primary">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              Verifique a Disponibilidade
            </CardTitle>
            <CardDescription>
              Selecione o período de check-in e check-out desejado.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 flex justify-center">
            <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              disabled={disabledDays}
              locale={ptBR}
              weekStartsOn={0}
              numberOfMonths={1}
              className="p-0"
              classNames={{
                months: "flex flex-col space-y-4",
                month: "space-y-4",
                caption_label: 'text-lg font-bold',
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...({}),
              }}
              modifiers={{ holiday: holidayDates }}
              modifiersClassNames={{
                selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90',
                today: 'bg-accent text-accent-foreground',
                outside: "text-muted-foreground opacity-50",
                holiday: "text-red-600 dark:text-red-400 font-bold",
                disabled: "bg-blue-100 text-blue-700 opacity-80 cursor-not-allowed",
              }}
            />
            <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full bg-accent" />
                <span>Hoje</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span>Datas Selecionadas</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                 <div className="h-3 w-3 rounded-full border border-red-600" />
                 <span className="font-bold text-red-600">Feriados</span>
              </div>
               <div className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Datas Indisponíveis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card className="shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Solicitar Reserva</CardTitle>
             <CardDescription>
                {date?.from && date.to ? 
                `Período: ${format(date.from, 'dd/MM/yy')} a ${format(date.to, 'dd/MM/yy')}` 
                : "Preencha seus dados para receber um orçamento."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" placeholder="Seu nome e sobrenome" required value={formData.name} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="seu@email.com" required value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Whatsapp</Label>
                    <Input id="phone" name="phone" placeholder="(99) 99999-9999" required value={formData.phone} onChange={handleInputChange} />
                  </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="guests">Número de Convidados (aprox.)</Label>
                <Input id="guests" name="guests" type="number" min="1" required value={formData.guests} onChange={handleInputChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" placeholder="Ex: Tipo de evento, necessidade de equipamentos, etc." value={formData.notes} onChange={handleInputChange} />
              </div>

                <Button type="submit" size="lg" className="w-full text-lg font-semibold" disabled={createReservationWithGuest.isPending}>
                  {createReservationWithGuest.isPending ? 'Enviando...' : 'Solicitar Reserva'}
              </Button>
               <p className="text-xs text-center text-muted-foreground pt-2">
                <Info className="inline h-3 w-3 mr-1" />
                O envio deste formulário é uma solicitação de orçamento e não garante a reserva.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
