import { useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePropertySettings } from '@/hooks/usePropertySettings';
import { usePricingRules, calculateTotalPrice } from '@/hooks/usePricingRules';
import { useBlockedDates } from '@/hooks/useBlockedDates';
import { useReservations, useCreateReservation } from '@/hooks/useReservations';
import { useCreateGuest } from '@/hooks/useGuests';
import { PropertyGallery } from '@/components/PropertyGallery';
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
  Lock,
  Image,
  Languages,
  Star,
  Award,
  Timeline,
  Sparkles,
  BadgeCheck
} from 'lucide-react';
import { format, differenceInDays, isWithinInterval, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';
import type { DateRange } from 'react-day-picker';
import styles from './Index.module.css';

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Piscina': Waves,
  'Churrasqueira': Flame,
  'Wi-Fi': Wifi,
  'Estacionamento': Car,
  'Ar condicionado': Wind,
  'Cozinha completa': UtensilsCrossed,
};

const palette = {
  darkBlue: '#1a237e',
  purple: '#7c3aed',
  gold: '#ffd700',
  bgGradient: 'linear-gradient(135deg, #1a237e 0%, #7c3aed 100%)',
};

const bookingSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  numGuests: z.number().min(1, 'Mínimo 1 hóspede'),
  notes: z.string().optional(),
});

export default function Index() {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  // Animation controls for hero rings
  const heroRings = useAnimation();
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
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

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
      const reservation = await createReservation.mutateAsync({
        guest_id: guest.id,
        check_in: format(dateRange.from, 'yyyy-MM-dd'),
        check_out: format(dateRange.to, 'yyyy-MM-dd'),
        num_guests: formData.numGuests,
        total_amount: totalPrice,
        notes: formData.notes || null,
        status: 'pending',
      });

      setTrackingCode(reservation.tracking_code);
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a237e] via-[#7c3aed] to-[#ffd700] font-sans text-[#1a237e]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#1a237e] to-[#7c3aed] shadow-lg"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            >
              <Waves className="h-7 w-7 text-white z-10" />
              {/* Animated rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#ffd700] opacity-60"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-1 rounded-full border border-[#7c3aed] opacity-40"
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
              />
            </motion.div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-[#1a237e] drop-shadow-sm">{property?.name || 'setor g espaço vip'}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              className="flex items-center gap-1 rounded-full border border-[#7c3aed] bg-white/80 px-3 py-1 text-xs font-semibold text-[#1a237e] shadow hover:bg-[#7c3aed] hover:text-white transition-colors"
              onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
            >
              <Languages className="h-4 w-4" />
              {lang === 'pt' ? 'PT' : 'EN'}
            </button>
            <Link to="/cliente">
              <Button variant="ghost" size="sm" className="rounded-full px-4 font-medium hover:bg-primary/10 transition-colors">
                Área do Cliente
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm" className="rounded-full px-4 font-medium border-primary/30 hover:bg-primary/10 transition-colors">
                <Lock className="mr-2 h-4 w-4" />
                Área Administrativa
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1a237e]/10 to-[#7c3aed]/5 py-16 md:py-24">
        {/* Animated background sparkles */}
        <motion.div
          className="absolute left-0 top-0 h-full w-full pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Sparkles className="absolute left-10 top-10 h-10 w-10 text-[#ffd700]/40 animate-pulse" />
          <Sparkles className="absolute right-20 top-24 h-8 w-8 text-[#7c3aed]/30 animate-pulse" />
          <Sparkles className="absolute left-1/2 bottom-10 h-12 w-12 text-[#1a237e]/20 animate-pulse" />
        </motion.div>
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1
              className="font-display text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-[#1a237e] drop-shadow-md"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {property?.name || 'setor g espaço vip'}
            </motion.h1>
            <motion.p
              className="mt-6 text-lg text-[#7c3aed] md:text-xl max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {lang === 'pt'
                ? property?.description || 'Perfeita para suas férias em família ou com amigos'
                : 'Perfect for your family or friends holidays'}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      {property?.images && property.images.length > 0 && (
        <section className="py-8">
          <div className="container">
            <div className="mb-6 flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Galeria de Fotos</h2>
            </div>
            <PropertyGallery images={property.images} />
          </div>
        </section>
      )}

      {/* Amenities */}
      <section className="border-b py-12 bg-white/60">
        <div className="container">
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {(property?.amenities || ['Piscina', 'Churrasqueira', 'Wi-Fi', 'Estacionamento']).map((amenity) => {
              const Icon = amenityIcons[amenity] || CheckCircle2;
              return (
                <motion.div
                  key={amenity}
                  className="flex items-center gap-2 rounded-lg bg-[#7c3aed]/10 px-3 py-1 text-[#1a237e] shadow-sm border border-[#7c3aed]/20"
                  whileHover={{ scale: 1.08, boxShadow: '0 4px 24px #7c3aed33' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="h-5 w-5 text-[#7c3aed] transition-transform group-hover:scale-110" />
                  <span className="font-semibold tracking-tight">{amenity}</span>
                </motion.div>
              );
            })}
            <motion.div
              className="flex items-center gap-2 rounded-lg bg-[#ffd700]/10 px-3 py-1 text-[#1a237e] shadow-sm border border-[#ffd700]/30"
              whileHover={{ scale: 1.08, boxShadow: '0 4px 24px #ffd70033' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Users className="h-5 w-5 text-[#ffd700] transition-transform group-hover:scale-110" />
              <span className="font-semibold tracking-tight">{lang === 'pt' ? `Até ${property?.max_guests || 10} hóspedes` : `Up to ${property?.max_guests || 10} guests`}</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-20" id="booking">
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
                  {trackingCode && (
                    <div className="mt-6 rounded-lg bg-primary/5 p-4">
                      <p className="text-sm text-muted-foreground">Seu código de acompanhamento:</p>
                      <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-primary">
                        {trackingCode}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Guarde este código para acompanhar o status da sua reserva
                      </p>
                    </div>
                  )}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link to={`/cliente?code=${trackingCode}`}>
                      <Button variant="outline">
                        Acessar Área do Cliente
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => {
                        setBookingSuccess(false);
                        setTrackingCode(null);
                        setDateRange(undefined);
                        setFormData({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' });
                      }}
                    >
                      Fazer nova reserva
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.7 }}
                >
                  <Card className="shadow-xl border-2 border-[#7c3aed]/10 bg-white/90">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-display text-[#7c3aed]">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        Escolha as Datas
                      </CardTitle>
                      <CardDescription>
                        Selecione a data de entrada e saída
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-xl border-2 border-[#7c3aed]/20 bg-gradient-to-br from-[#7c3aed]/10 to-white p-2 shadow-inner">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={1}
                          disabled={(date) => date < new Date() || isDateBlocked(date)}
                          locale={ptBR}
                          className="pointer-events-auto rounded-lg border-none"
                        />
                      </div>
                      {dateRange?.from && dateRange?.to && (
                        <div className="mt-6 space-y-3 rounded-lg bg-primary/5 p-4 shadow-sm">
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
                      <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nome completo *</Label>
                          <Input
                            id="fullName"
                            autoComplete="name"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Seu nome"
                            className="rounded-full border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                          />
                          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                        </div>
                        {/* ...existing code for other fields... */}
                        <Button 
                          type="submit" 
                          className="w-full rounded-full bg-gradient-to-tr from-[#1a237e] to-[#7c3aed] text-white font-bold shadow-lg hover:from-[#7c3aed] hover:to-[#1a237e] transition-all text-lg py-3 border-2 border-[#ffd700]/40"
                          size="lg"
                          disabled={isSubmitting || !dateRange?.from || !dateRange?.to}
                          whileHover={{ scale: 1.04, boxShadow: '0 4px 24px #ffd70033' }}
                          as={motion.button}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {lang === 'pt' ? 'Enviando...' : 'Sending...'}
                            </>
                          ) : (
                            lang === 'pt' ? 'Solicitar Reserva' : 'Request Booking'
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-t from-[#1a237e]/10 to-white py-8">
        <div className="container text-center text-sm text-[#7c3aed]">
          <p>© {new Date().getFullYear()} {property?.name || 'setor g espaço vip'}. {lang === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
}
