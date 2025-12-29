import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePropertySettings } from '@/hooks/usePropertySettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Waves, 
  Search, 
  CalendarDays, 
  Users, 
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  Home
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReservationData {
  id: string;
  tracking_code: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'partial' | 'paid';
  notes: string | null;
  created_at: string;
  guest: {
    full_name: string;
    phone: string;
    email: string | null;
  } | null;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    description: 'Sua reserva está aguardando confirmação.',
    icon: Clock,
    color: 'bg-warning/10 text-warning border-warning/20',
  },
  confirmed: {
    label: 'Confirmada',
    description: 'Sua reserva foi confirmada! Aguardamos você.',
    icon: CheckCircle2,
    color: 'bg-success/10 text-success border-success/20',
  },
  cancelled: {
    label: 'Cancelada',
    description: 'Esta reserva foi cancelada.',
    icon: XCircle,
    color: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  completed: {
    label: 'Concluída',
    description: 'Esperamos que tenha aproveitado sua estadia!',
    icon: CheckCircle2,
    color: 'bg-muted text-muted-foreground border-muted',
  },
};

const paymentStatusLabels = {
  pending: 'Pagamento pendente',
  partial: 'Pagamento parcial',
  paid: 'Pago',
};

export default function TrackReservation() {
  const { toast } = useToast();
  const { data: property } = usePropertySettings();
  const [trackingCode, setTrackingCode] = useState('');
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'Por favor, insira o código de rastreamento.',
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          tracking_code,
          check_in,
          check_out,
          num_guests,
          total_amount,
          status,
          payment_status,
          notes,
          created_at,
          guest:guests(full_name, phone, email)
        `)
        .eq('tracking_code', trackingCode.toUpperCase().trim())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setReservation(data as unknown as ReservationData);
      } else {
        setReservation(null);
        toast({
          variant: 'destructive',
          title: 'Reserva não encontrada',
          description: 'Verifique o código e tente novamente.',
        });
      }
    } catch (error) {
      console.error('Error fetching reservation:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível buscar a reserva.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nights = reservation 
    ? differenceInDays(parseISO(reservation.check_out), parseISO(reservation.check_in))
    : 0;

  const StatusIcon = reservation ? statusConfig[reservation.status].icon : Clock;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Waves className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-semibold">{property?.name || 'Casa com Piscina'}</span>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Página Inicial
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          {/* Search Form */}
          <Card className="mb-8 shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">Acompanhe sua Reserva</CardTitle>
              <CardDescription>
                Digite o código de rastreamento que você recebeu ao fazer a reserva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="tracking-code" className="sr-only">Código de rastreamento</Label>
                  <Input
                    id="tracking-code"
                    placeholder="Ex: A1B2C3D4"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono uppercase tracking-widest"
                    maxLength={8}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reservation Details */}
          {reservation && (
            <Card className="animate-fade-in shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display">Detalhes da Reserva</CardTitle>
                    <CardDescription>Código: {reservation.tracking_code}</CardDescription>
                  </div>
                  <Badge variant="outline" className={statusConfig[reservation.status].color}>
                    {statusConfig[reservation.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Banner */}
                <div className={`flex items-center gap-4 rounded-lg p-4 ${statusConfig[reservation.status].color}`}>
                  <StatusIcon className="h-8 w-8" />
                  <div>
                    <p className="font-semibold">{statusConfig[reservation.status].label}</p>
                    <p className="text-sm opacity-80">{statusConfig[reservation.status].description}</p>
                  </div>
                </div>

                <Separator />

                {/* Guest Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-muted-foreground">Hóspede</h3>
                  <p className="text-lg font-medium">{reservation.guest?.full_name}</p>
                  <p className="text-muted-foreground">{reservation.guest?.phone}</p>
                  {reservation.guest?.email && (
                    <p className="text-muted-foreground">{reservation.guest.email}</p>
                  )}
                </div>

                <Separator />

                {/* Dates */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in</p>
                      <p className="font-semibold">
                        {format(parseISO(reservation.check_in), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Check-out</p>
                      <p className="font-semibold">
                        {format(parseISO(reservation.check_out), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-primary/5 p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Hóspedes</p>
                        <p className="font-semibold">{reservation.num_guests}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Diárias</p>
                        <p className="font-semibold">{nights}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pagamento</p>
                        <p className="font-semibold">{paymentStatusLabels[reservation.payment_status]}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                  <span className="text-lg font-medium">Valor Total</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {Number(reservation.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {reservation.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-2 font-semibold text-muted-foreground">Observações</h3>
                      <p className="text-muted-foreground">{reservation.notes}</p>
                    </div>
                  </>
                )}

                {/* Created At */}
                <p className="text-center text-sm text-muted-foreground">
                  Reserva criada em {format(parseISO(reservation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Not Found */}
          {hasSearched && !reservation && !isLoading && (
            <Card className="text-center">
              <CardContent className="py-12">
                <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-display text-xl font-semibold">Reserva não encontrada</h3>
                <p className="mt-2 text-muted-foreground">
                  Verifique se digitou o código corretamente e tente novamente.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
