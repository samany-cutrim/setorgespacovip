import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useReservations } from '@/hooks/useReservations';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Clock, AlertCircle, Download, FileText, ArrowLeft } from 'lucide-react';
import { Reservation } from '@/lib/types';

export default function ClientArea() {
  const [searchParams] = useSearchParams();
  const [searchCode, setSearchCode] = useState('');
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(null);
  const { toast } = useToast();
  const { data: reservations } = useReservations();

  const reservationCode = searchParams.get('codigo') || '';

  const handleSearch = (code: string) => {
    if (!code.trim()) {
      toast({
        title: "Código vazio",
        description: "Digite um código de reserva para buscar.",
        variant: "destructive",
      });
      return;
    }

    const reservation = reservations?.find((r) => r.tracking_code?.toUpperCase() === code.toUpperCase());
    
    if (reservation) {
      setFoundReservation(reservation);
    } else {
      toast({
        title: "Reserva não encontrada",
        description: "Verifique o código e tente novamente.",
        variant: "destructive",
      });
      setFoundReservation(null);
    }
  };

  // Auto-search se houver código na URL
  useEffect(() => {
    if (reservationCode && reservations) {
      const reservation = reservations.find((r) => r.tracking_code?.toUpperCase() === reservationCode.toUpperCase());
      if (reservation) {
        setFoundReservation(reservation);
      }
    }
  }, [reservationCode, reservations]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendente',
      'confirmed': 'Confirmada',
      'cancelled': 'Cancelada',
      'completed': 'Concluída',
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendente',
      'partial': 'Parcial',
      'paid': 'Pago',
    };
    return labels[status] || status;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-primary text-primary-foreground py-4 px-4 md:px-6 shadow-md flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0">
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          <span className="text-sm md:text-base">Voltar</span>
        </Link>
        <h1 className="text-base md:text-xl lg:text-2xl font-bold text-center flex-1 min-w-0 truncate px-2">Setor G Espaço VIP - Área do Cliente</h1>
        <div className="w-12 md:w-20 flex-shrink-0"></div>
      </header>

      <main className="flex-1 container mx-auto py-10 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Acompanhe sua Reserva</CardTitle>
            <CardDescription className="text-sm md:text-base">Digite o código da sua reserva para acompanhar o status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Label htmlFor="code" className="text-sm">Código da Reserva</Label>
                <Input
                  id="code"
                  placeholder="Ex: ABC12345"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchCode)}
                  className="mt-1 text-sm md:text-base"
                />
              </div>
              <Button onClick={() => handleSearch(searchCode)} className="mt-5 w-full sm:w-auto">
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {foundReservation && (
          <div className="space-y-6">
            {/* Reservation Info */}
            <Card>
              <CardHeader className="bg-gray-100 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg md:text-xl break-words">Código de Reserva: {foundReservation.id?.substring(0, 8).toUpperCase()}</CardTitle>
                    <CardDescription className="text-sm">Reserva de {foundReservation.guest?.full_name}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusIcon(foundReservation.status)}
                    <span className="font-semibold text-base md:text-lg">{getStatusLabel(foundReservation.status)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:p-6">
                <div>
                  <Label className="text-xs text-muted-foreground">Check-in</Label>
                  <p className="text-base md:text-lg font-semibold">
                    {format(parseISO(foundReservation.check_in), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Check-out</Label>
                  <p className="text-base md:text-lg font-semibold">
                    {format(parseISO(foundReservation.check_out), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Número de Hóspedes</Label>
                  <p className="text-base md:text-lg font-semibold">{foundReservation.num_guests} pessoa(s)</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pagamento</Label>
                  <p className="text-base md:text-lg font-semibold">{getPaymentStatusLabel(foundReservation.payment_status)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Confirmation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Status da Confirmação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg border-2 ${
                  foundReservation.status === 'confirmed' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start sm:items-center gap-2">
                    {foundReservation.status === 'confirmed' ? (
                      <>
                        <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0 mt-1 sm:mt-0" />
                        <div>
                          <p className="font-semibold text-green-900 text-sm md:text-base">Sua reserva foi confirmada!</p>
                          <p className="text-xs md:text-sm text-green-800">Enviamos um email com todos os detalhes.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600 flex-shrink-0 mt-1 sm:mt-0" />
                        <div>
                          <p className="font-semibold text-yellow-900 text-sm md:text-base">Sua reserva está em análise</p>
                          <p className="text-xs md:text-sm text-yellow-800">Entraremos em contato em breve para confirmar.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {foundReservation.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <Label className="text-xs text-muted-foreground">Observações</Label>
                    <p className="mt-2 text-sm break-words">{foundReservation.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contract */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Contrato e Documentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {foundReservation.contract_url ? (
                  <a href={foundReservation.contract_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm md:text-base">
                      <Download className="h-4 w-4" />
                      Baixar Contrato de Reserva
                    </Button>
                  </a>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-gray-600">O contrato será disponibilizado após a confirmação.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-gray-600 mb-4">Entre em contato conosco pelos canais abaixo:</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="https://www.instagram.com/setorgespaco_vip/" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full text-sm md:text-base">Instagram</Button>
                  </a>
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full text-sm md:text-base">WhatsApp</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!foundReservation && searchCode && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <p className="text-red-800">Nenhuma reserva encontrada com esse código.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-primary text-primary-foreground py-6 px-4 md:px-6 text-center mt-auto">
        <p className="text-sm md:text-base">&copy; 2026 Setor G Espaço VIP. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}







