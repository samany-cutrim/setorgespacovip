import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// ...supabase removido...
import { usePropertySettings } from '@/hooks/usePropertySettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Home,
  FileText,
  History,
  ClipboardCheck,
  AlertCircle
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
  contract_accepted: boolean;
  contract_accepted_at: string | null;
  guest: {
    id: string;
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

export default function ClientArea() {
  const { toast } = useToast();
  const { data: property } = usePropertySettings();
  const [searchParams] = useSearchParams();
  
  const [trackingCode, setTrackingCode] = useState(searchParams.get('code') || '');
  const [phone, setPhone] = useState('');
  const [currentReservation, setCurrentReservation] = useState<ReservationData | null>(null);
  const [allReservations, setAllReservations] = useState<ReservationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('status');
  
  // Contract modal
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (searchParams.get('code')) {
      setTrackingCode(searchParams.get('code') || '');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingCode.trim() || !phone.trim()) {
      toast({
        variant: 'destructive',
        title: 'Dados incompletos',
        description: 'Por favor, preencha o código e o telefone.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Fetch reservation by tracking code and verify phone
      // API integration pending
      toast({
        variant: 'destructive',
        title: 'Funcionalidade em desenvolvimento',
        description: 'A área do cliente está em desenvolvimento. Por favor, aguarde.',
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível acessar a área do cliente.',
      });
      setIsLoading(false);
    }
  };

  const handleAcceptContract = async () => {
    if (!currentReservation || !contractAccepted) return;

    setIsAccepting(true);

    try {
      // TODO: API integration pending
      // Simulate contract acceptance
      setCurrentReservation({
        ...currentReservation,
        contract_accepted: true,
        contract_accepted_at: new Date().toISOString(),
      });

      // Update in all reservations list
      setAllReservations(prev => 
        prev.map(r => r.id === currentReservation.id 
          ? { ...r, contract_accepted: true, contract_accepted_at: new Date().toISOString() }
          : r
        )
      );

      setShowContractModal(false);
      toast({
        title: 'Contrato aceito!',
        description: 'O contrato foi aceito com sucesso.',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível aceitar o contrato.',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentReservation(null);
    setAllReservations([]);
    setTrackingCode('');
    setPhone('');
  };

  const nights = currentReservation 
    ? differenceInDays(parseISO(currentReservation.check_out), parseISO(currentReservation.check_in))
    : 0;

  const StatusIcon = currentReservation ? statusConfig[currentReservation.status].icon : Clock;

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Waves className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-semibold">{property?.name || 'setor g espaço vip'}</span>
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
          <div className="mx-auto max-w-md">
            <Card className="shadow-card">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-display text-2xl">Área do Cliente</CardTitle>
                <CardDescription>
                  Acesse com seu código de reserva e telefone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tracking-code">Código da Reserva</Label>
                    <Input
                      id="tracking-code"
                      placeholder="Ex: A1B2C3D4"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                      className="text-center font-mono text-lg uppercase tracking-widest"
                      maxLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone cadastrado</Label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    Acessar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Client Area
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Waves className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-semibold">{property?.name || 'setor g espaço vip'}</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, <span className="font-medium text-foreground">{currentReservation?.guest?.full_name}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="status" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
            <TabsTrigger value="contract" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Contrato</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Current Reservation */}
              <Card className="lg:col-span-2 shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display">Reserva Atual</CardTitle>
                      <CardDescription>Código: {currentReservation?.tracking_code}</CardDescription>
                    </div>
                    <Badge variant="outline" className={statusConfig[currentReservation?.status || 'pending'].color}>
                      {statusConfig[currentReservation?.status || 'pending'].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentReservation && (
                    <>
                      <div className={`flex items-center gap-4 rounded-lg p-4 ${statusConfig[currentReservation.status].color}`}>
                        <StatusIcon className="h-8 w-8" />
                        <div>
                          <p className="font-semibold">{statusConfig[currentReservation.status].label}</p>
                          <p className="text-sm opacity-80">{statusConfig[currentReservation.status].description}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                          <CalendarDays className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Check-in</p>
                            <p className="font-semibold">
                              {format(parseISO(currentReservation.check_in), "dd 'de' MMM, yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                          <CalendarDays className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Check-out</p>
                            <p className="font-semibold">
                              {format(parseISO(currentReservation.check_out), "dd 'de' MMM, yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">{nights} diárias</p>
                            <p className="text-sm text-muted-foreground">{currentReservation.num_guests} hóspedes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Valor Total</p>
                          <p className="text-2xl font-bold text-primary">
                            R$ {Number(currentReservation.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        currentReservation?.contract_accepted ? 'bg-success/10' : 'bg-warning/10'
                      }`}>
                        {currentReservation?.contract_accepted ? (
                          <ClipboardCheck className="h-5 w-5 text-success" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Contrato</p>
                        <p className="text-sm text-muted-foreground">
                          {currentReservation?.contract_accepted ? 'Aceito' : 'Pendente'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        currentReservation?.payment_status === 'paid' ? 'bg-success/10' : 'bg-warning/10'
                      }`}>
                        <CreditCard className={`h-5 w-5 ${
                          currentReservation?.payment_status === 'paid' ? 'text-success' : 'text-warning'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Pagamento</p>
                        <p className="text-sm text-muted-foreground">
                          {paymentStatusLabels[currentReservation?.payment_status || 'pending']}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <History className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Total de Reservas</p>
                        <p className="text-sm text-muted-foreground">
                          {allReservations.length} reserva(s)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Contract Tab */}
          <TabsContent value="contract">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <FileText className="h-5 w-5 text-primary" />
                  Contrato de Locação
                </CardTitle>
                <CardDescription>
                  Leia e aceite os termos do contrato de locação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentReservation?.contract_accepted ? (
                  <div className="rounded-lg bg-success/10 p-6 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                    <h3 className="mt-4 font-display text-xl font-semibold text-success">Contrato Aceito</h3>
                    <p className="mt-2 text-muted-foreground">
                      Você aceitou o contrato em{' '}
                      {currentReservation.contract_accepted_at && 
                        format(parseISO(currentReservation.contract_accepted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg bg-warning/10 p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-warning" />
                        <p className="text-sm font-medium text-warning">
                          O contrato precisa ser aceito para confirmar sua reserva
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="h-64 rounded-lg border p-4">
                      <div className="space-y-4 text-sm">
                        <h4 className="font-semibold">CONTRATO DE LOCAÇÃO DE IMÓVEL POR TEMPORADA</h4>
                        
                        <p><strong>LOCADOR:</strong> {property?.name || 'setor g espaço vip'}</p>
                        <p><strong>LOCATÁRIO:</strong> {currentReservation?.guest?.full_name}</p>
                        
                        <p><strong>PERÍODO:</strong> {currentReservation && format(parseISO(currentReservation.check_in), "dd/MM/yyyy", { locale: ptBR })} a {currentReservation && format(parseISO(currentReservation.check_out), "dd/MM/yyyy", { locale: ptBR })}</p>
                        
                        <p><strong>VALOR:</strong> R$ {currentReservation && Number(currentReservation.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>

                        <h5 className="font-semibold pt-4">CLÁUSULAS:</h5>
                        
                        <p><strong>1. DO OBJETO:</strong> O presente contrato tem como objeto a locação do imóvel para fins exclusivamente residenciais, pelo período de temporada acima descrito.</p>
                        
                        <p><strong>2. DO VALOR E PAGAMENTO:</strong> O LOCATÁRIO se compromete a pagar o valor acordado nas condições estabelecidas.</p>
                        
                        <p><strong>3. DA UTILIZAÇÃO:</strong> O imóvel deverá ser utilizado exclusivamente para hospedagem, sendo vedada a realização de eventos ou festas sem autorização prévia.</p>
                        
                        <p><strong>4. DA RESPONSABILIDADE:</strong> O LOCATÁRIO é responsável por quaisquer danos causados ao imóvel e seus bens durante o período de locação.</p>
                        
                        <p><strong>5. DO CHECK-IN E CHECK-OUT:</strong> O check-in será realizado a partir das 14h e o check-out até as 11h do dia de saída.</p>
                        
                        <p><strong>6. DAS REGRAS:</strong> É proibido fumar nas áreas internas do imóvel. Animais de estimação somente com autorização prévia.</p>
                        
                        <p><strong>7. DO CANCELAMENTO:</strong> Em caso de cancelamento pelo LOCATÁRIO, aplicam-se as políticas de cancelamento vigentes.</p>
                        
                        <p><strong>8. DA CAPACIDADE:</strong> O número máximo de hóspedes é de {currentReservation?.num_guests} pessoas, conforme reservado.</p>
                      </div>
                    </ScrollArea>

                    <Button onClick={() => setShowContractModal(true)} className="w-full" size="lg">
                      <FileText className="mr-2 h-4 w-4" />
                      Aceitar Contrato
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <History className="h-5 w-5 text-primary" />
                  Histórico de Reservas
                </CardTitle>
                <CardDescription>
                  Todas as suas reservas em {property?.name || 'setor g espaço vip' }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allReservations.length === 0 ? (
                  <div className="py-12 text-center">
                    <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground">Nenhuma reserva encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className={`rounded-lg border p-4 transition-colors ${
                          reservation.id === currentReservation?.id ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">{reservation.tracking_code}</span>
                              {reservation.id === currentReservation?.id && (
                                <Badge variant="secondary" className="text-xs">Atual</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(reservation.check_in), "dd/MM/yyyy", { locale: ptBR })} - {format(parseISO(reservation.check_out), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={statusConfig[reservation.status].color}>
                              {statusConfig[reservation.status].label}
                            </Badge>
                            <span className="font-semibold text-primary">
                              R$ {Number(reservation.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{reservation.num_guests} hóspedes</span>
                          <span>•</span>
                          <span>{differenceInDays(parseISO(reservation.check_out), parseISO(reservation.check_in))} diárias</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {reservation.contract_accepted ? (
                              <><CheckCircle2 className="h-3 w-3 text-success" /> Contrato aceito</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 text-warning" /> Contrato pendente</>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contract Acceptance Modal */}
      <Dialog open={showContractModal} onOpenChange={setShowContractModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceitar Contrato</DialogTitle>
            <DialogDescription>
              Ao aceitar, você confirma que leu e concorda com todos os termos do contrato de locação.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start space-x-3 py-4">
            <Checkbox
              id="accept"
              checked={contractAccepted}
              onCheckedChange={(checked) => setContractAccepted(checked as boolean)}
            />
            <label
              htmlFor="accept"
              className="text-sm leading-relaxed"
            >
              Li e aceito os termos do contrato de locação. Declaro que as informações fornecidas são verdadeiras e me comprometo a cumprir todas as cláusulas estabelecidas.
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAcceptContract} 
              disabled={!contractAccepted || isAccepting}
            >
              {isAccepting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}