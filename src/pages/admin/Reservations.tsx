import { useState } from 'react';
import { useReservations, useUpdateReservation, useDeleteReservation, useCreateReservation } from '@/hooks/useReservations';
import { usePropertySettings } from '@/hooks/usePropertySettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ReservationDialog, ReservationFormData } from '@/components/admin/ReservationDialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Loader2,
  CalendarDays,
  MessageCircle,
  Send,
  Bell,
  CreditCard,
  FileCheck,
  FileX,
  Plus,
  Pencil
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReservationStatus, PaymentStatus, Reservation } from '@/lib/types';
import { 
  generateWhatsAppLink, 
  generateConfirmationMessage, 
  generateReminderMessage,
  generatePaymentReminderMessage,
  generateCustomMessage
} from '@/lib/whatsapp';

const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-muted text-muted-foreground border-muted',
};

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Concluída',
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  partial: 'bg-primary/10 text-primary border-primary/20',
  paid: 'bg-success/10 text-success border-success/20',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'Pendente',
  partial: 'Parcial',
  paid: 'Pago',
};

export default function AdminReservations() {
  const { toast } = useToast();
  const { data: reservations = [], isLoading } = useReservations();
  const { data: property } = usePropertySettings();
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = r.guest?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.guest?.phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    try {
      await updateReservation.mutateAsync({ id, status });
      toast({
        title: 'Status atualizado',
        description: `Reserva marcada como ${statusLabels[status].toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReservation.mutateAsync(deleteId);
      toast({
        title: 'Reserva excluída',
        description: 'A reserva foi removida com sucesso.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir a reserva.',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleOpenDialog = (reservation?: Reservation) => {
    setEditingReservation(reservation || null);
    setIsDialogOpen(true);
  };

  const handleSaveReservation = async (data: ReservationFormData) => {
    setIsSaving(true);
    try {
      if (editingReservation) {
        await updateReservation.mutateAsync({
          id: editingReservation.id,
          ...data,
        });
        toast({
          title: 'Reserva atualizada',
          description: 'A reserva foi atualizada com sucesso.',
        });
      } else {
        await createReservation.mutateAsync(data);
        toast({
          title: 'Reserva criada',
          description: 'A nova reserva foi criada com sucesso.',
        });
      }
      setIsDialogOpen(false);
      setEditingReservation(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar a reserva.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openWhatsApp = (phone: string, message: string) => {
    const url = generateWhatsAppLink(phone, message);
    window.open(url, '_blank');
  };

  const getReservationDetails = (reservation: typeof reservations[0]) => ({
    guestName: reservation.guest?.full_name || 'Hóspede',
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
    totalAmount: Number(reservation.total_amount),
    propertyName: property?.name,
    trackingCode: reservation.tracking_code || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as reservas do seu imóvel
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Reservas</CardTitle>
              <CardDescription>{filteredReservations.length} reservas encontradas</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar hóspede..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nenhuma reserva encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hóspede</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reservation.guest?.full_name || '-'}</p>
                          <p className="text-sm text-muted-foreground">{reservation.guest?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(reservation.check_in), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(reservation.check_out), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-medium">
                            R$ {(Number(reservation.total_amount) - Number(reservation.discount_amount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          {Number(reservation.discount_amount || 0) > 0 && (
                            <p className="text-xs text-success">
                              -R$ {Number(reservation.discount_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} desc.
                            </p>
                          )}
                          {Number(reservation.deposit_amount || 0) > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Entrada: R$ {Number(reservation.deposit_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[reservation.status]}>
                          {statusLabels[reservation.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {reservation.contract_accepted ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                            <FileCheck className="h-3 w-3" />
                            Aceito
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
                            <FileX className="h-3 w-3" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={paymentStatusColors[reservation.payment_status]}>
                          {paymentStatusLabels[reservation.payment_status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {reservation.guest?.phone && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2">
                                <MessageCircle className="h-4 w-4 text-green-600" />
                                <span className="hidden sm:inline">Enviar</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Enviar mensagem</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openWhatsApp(
                                  reservation.guest!.phone,
                                  generateConfirmationMessage(getReservationDetails(reservation))
                                )}
                              >
                                <Send className="mr-2 h-4 w-4 text-green-600" />
                                Confirmação de reserva
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openWhatsApp(
                                  reservation.guest!.phone,
                                  generateReminderMessage(getReservationDetails(reservation))
                                )}
                              >
                                <Bell className="mr-2 h-4 w-4 text-primary" />
                                Lembrete de check-in
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openWhatsApp(
                                  reservation.guest!.phone,
                                  generatePaymentReminderMessage(
                                    getReservationDetails(reservation),
                                    Number(reservation.total_amount)
                                  )
                                )}
                              >
                                <CreditCard className="mr-2 h-4 w-4 text-warning" />
                                Lembrete de pagamento
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openWhatsApp(
                                  reservation.guest!.phone,
                                  generateCustomMessage(reservation.guest!.full_name)
                                )}
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Mensagem personalizada
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenDialog(reservation)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar reserva
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(reservation.id, 'confirmed')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-success" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(reservation.id, 'completed')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como concluída
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(reservation.id, 'cancelled')}>
                              <XCircle className="mr-2 h-4 w-4 text-destructive" />
                              Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteId(reservation.id)}
                            >
                              Excluir reserva
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ReservationDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingReservation(null);
        }}
        reservation={editingReservation}
        onSave={handleSaveReservation}
        isLoading={isSaving}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A reserva será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
