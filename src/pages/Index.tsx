import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePropertySettings } from '@/hooks/usePropertySettings';
import { usePricingRules, calculateTotalPrice } from '@/hooks/usePricingRules';
import { useBlockedDates } from '@/hooks/useBlockedDates';
import { useReservations, useCreateReservation } from '@/hooks/useReservations';
import { useCreateGuest } from '@/hooks/useGuests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Waves, 
  CalendarDays, 
  Users, 
  Wifi, 
  Car, 
  Flame,
  Wind,
  UtensilsCrossed,
  CheckCircle2,
  Loader2,
  Lock
} from 'lucide-react';
import { format, differenceInDays, isWithinInterval, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';
import type { DateRange } from 'react-day-picker';

const amenityIcons: Record<string, any> = {
  'Piscina': Waves,
  'Churrasqueira': Flame,
  'Wi-Fi': Wifi,
  'Estacionamento': Car,
  'Ar condicionado': Wind,
  'Cozinha completa': UtensilsCrossed,
};

const bookingSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  numGuests: z.number().min(1, 'Mínimo 1 hóspede'),
  notes: z.string().optional(),
});

export default function Index() {
  const { toast } = useToast();
  const { data: property, isLoading: propertyLoading } = usePropertySettings();
  const { data: pricingRules = [] } = usePricingRules();
  const { data: blockedDates = [] } = useBlockedDates();
  const { data: reservations = [] } = useReservations();
  const createGuest = useCreateGuest();
  const createReservation = useCreateReservation();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    numGuests: 1,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const totalPrice = dateRange?.from && dateRange?.to 
    ? calculateTotalPrice(dateRange.from, dateRange.to, pricingRules)
    : 0;

  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;

  const isDateBlocked = (date: Date) => {
    // Check blocked dates
    for (const blocked of blockedDates) {
      if (isWithinInterval(date, {
        start: parseISO(blocked.start_date),
        end: parseISO(blocked.end_date),
      })) {
        return true;
      }
    }

    // Check existing reservations
    for (const reservation of reservations) {
      if (reservation.status === 'cancelled') continue;
      if (isWithinInterval(date, {
        start: parseISO(reservation.check_in),
        end: addDays(parseISO(reservation.check_out), -1),
      })) {
        return true;
      }
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        variant: 'destructive',
        title: 'Selecione as datas',
        description: 'Por favor, selecione a data de entrada e saída.',
      });
      return;
    }

    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create guest
      const guest = await createGuest.mutateAsync({
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email || null,
        document: null,
        notes: null,
      });

      // Create reservation
      await createReservation.mutateAsync({
        guest_id: guest.id,
        check_in: format(dateRange.from, 'yyyy-MM-dd'),
        check_out: format(dateRange.to, 'yyyy-MM-dd'),
        num_guests: formData.numGuests,
        total_amount: totalPrice,
        notes: formData.notes || null,
        status: 'pending',
      });

      setBookingSuccess(true);
      toast({
        title: 'Reserva enviada!',
        description: 'Entraremos em contato em breve para confirmar sua reserva.',
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar reserva',
        description: 'Por favor, tente novamente ou entre em contato conosco.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (propertyLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Waves className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-semibold">{property?.name || 'Casa com Piscina'}</span>
          </div>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              <Lock className="mr-2 h-4 w-4" />
              Área Administrativa
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-fade-in font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {property?.name || 'Casa com Piscina'}
            </h1>
            <p className="mt-6 animate-fade-in text-lg text-muted-foreground md:text-xl" style={{ animationDelay: '0.1s' }}>
              {property?.description || 'Perfeita para suas férias em família ou com amigos'}
            </p>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="border-b py-12">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {(property?.amenities || ['Piscina', 'Churrasqueira', 'Wi-Fi', 'Estacionamento']).map((amenity) => {
              const Icon = amenityIcons[amenity] || CheckCircle2;
              return (
                <div key={amenity} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-5 w-5 text-primary" />
                  <span>{amenity}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span>Até {property?.max_guests || 10} hóspedes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-16" id="booking">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl font-bold">Faça sua Reserva</h2>
              <p className="mt-2 text-muted-foreground">
                Selecione as datas e preencha seus dados para solicitar uma reserva
              </p>
            </div>

            {bookingSuccess ? (
              <Card className="mx-auto max-w-md text-center shadow-card">
                <CardContent className="pt-12 pb-8">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold">Reserva Enviada!</h3>
                  <p className="mt-2 text-muted-foreground">
                    Sua solicitação foi recebida. Entraremos em contato em breve para confirmar a reserva.
                  </p>
                  <Button 
                    className="mt-6" 
                    onClick={() => {
                      setBookingSuccess(false);
                      setDateRange(undefined);
                      setFormData({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' });
                    }}
                  >
                    Fazer nova reserva
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Calendar */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      Escolha as Datas
                    </CardTitle>
                    <CardDescription>
                      Selecione a data de entrada e saída
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      disabled={(date) => date < new Date() || isDateBlocked(date)}
                      locale={ptBR}
                      className="pointer-events-auto rounded-md border"
                    />
                    
                    {dateRange?.from && dateRange?.to && (
                      <div className="mt-6 space-y-3 rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Check-in</span>
                          <span className="font-medium">{format(dateRange.from, "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Check-out</span>
                          <span className="font-medium">{format(dateRange.to, "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{nights} {nights === 1 ? 'diária' : 'diárias'}</span>
                          <span className="text-xl font-bold text-primary">
                            R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Form */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <Users className="h-5 w-5 text-primary" />
                      Seus Dados
                    </CardTitle>
                    <CardDescription>
                      Preencha as informações para solicitar a reserva
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome completo *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Seu nome"
                        />
                        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                        />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="seu@email.com"
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numGuests">Quantidade de hóspedes *</Label>
                        <Input
                          id="numGuests"
                          type="number"
                          min={1}
                          max={property?.max_guests || 10}
                          value={formData.numGuests}
                          onChange={(e) => setFormData(prev => ({ ...prev, numGuests: parseInt(e.target.value) || 1 }))}
                        />
                        {errors.numGuests && <p className="text-sm text-destructive">{errors.numGuests}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Alguma informação adicional?"
                          rows={3}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isSubmitting || !dateRange?.from || !dateRange?.to}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          'Solicitar Reserva'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {property?.name || 'Casa com Piscina'}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
