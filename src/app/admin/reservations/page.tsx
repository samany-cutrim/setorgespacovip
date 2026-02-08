import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReservations, useUpdateReservation, useDeleteReservation, useCreateReservation } from '@/hooks/useReservations';
import { useCreatePayment } from '@/hooks/usePayments';
import { useUpsertReservationBlockedDate, useDeleteBlockedDateByReservation } from '@/hooks/useBlockedDates';
import { useGuests } from '@/hooks/useGuests';
import { Reservation, ReservationStatus, PaymentStatus } from '@/lib/types';
import { parseDateOnly } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Reservations() {
  const { data: reservations, isLoading } = useReservations();
  const { data: guests } = useGuests();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const createReservation = useCreateReservation();
  const createPayment = useCreatePayment();
  const upsertReservationBlockedDate = useUpsertReservationBlockedDate();
  const deleteBlockedDateByReservation = useDeleteBlockedDateByReservation();
  const { toast } = useToast();

  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingContract, setIsDeletingContract] = useState(false);

  const getPaidTotal = async (reservationId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('reservation_id', reservationId);

    if (error) throw error;

    return (data || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  };

  // Form state para criar/editar
  const [formData, setFormData] = useState({
    guest_id: '',
    check_in: '',
    check_out: '',
    num_guests: 1,
    total_amount: 0,
    deposit_amount: 0,
    discount_amount: 0,
    status: 'pending' as ReservationStatus,
    payment_status: 'pending' as PaymentStatus,
    notes: '',
    contract_url: ''
  });

  const handleNewClick = () => {
    setEditingReservation(null);
    setIsCreating(true);
    setContractFile(null);
    setFormData({
      guest_id: '',
      check_in: '',
      check_out: '',
      num_guests: 1,
      total_amount: 0,
      deposit_amount: 0,
      discount_amount: 0,
      status: 'pending',
      payment_status: 'pending',
      notes: '',
      contract_url: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setIsCreating(false);
    setContractFile(null);
    setFormData({
      guest_id: reservation.guest_id || '',
      check_in: reservation.check_in,
      check_out: reservation.check_out,
      num_guests: reservation.num_guests,
      total_amount: reservation.total_amount,
      deposit_amount: reservation.deposit_amount,
      discount_amount: reservation.discount_amount,
      status: reservation.status,
      payment_status: reservation.payment_status,
      notes: reservation.notes || '',
      contract_url: reservation.contract_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta reserva?")) {
      try {
        await deleteReservation.mutateAsync(id);
        toast({ title: "Reserva excluída com sucesso" });
      } catch (error) {
        toast({ title: "Erro ao excluir", variant: "destructive" });
      }
    }
  };

  const getContractFilePath = (url: string) => {
    try {
      const parsed = new URL(url);
      const marker = '/storage/v1/object/public/contract_files/';
      const index = parsed.pathname.indexOf(marker);
      if (index === -1) return null;
      return parsed.pathname.slice(index + marker.length);
    } catch {
      return null;
    }
  };

  const handleDeleteContract = async () => {
    if (!editingReservation?.id || !formData.contract_url) return;
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return;
    try {
      setIsDeletingContract(true);
      const filePath = getContractFilePath(formData.contract_url);
      if (filePath) {
        const { error: removeError } = await supabase.storage
          .from('contract_files')
          .remove([filePath]);
        if (removeError) throw removeError;
      }

      await updateReservation.mutateAsync({
        id: editingReservation.id,
        contract_url: null,
      });

      setFormData((prev) => ({ ...prev, contract_url: '' }));
      toast({ title: "Contrato removido" });
    } catch (error) {
      toast({ title: "Erro ao remover contrato", variant: "destructive" });
    } finally {
      setIsDeletingContract(false);
    }
  };

  const handleSave = async () => {
    try {
      let contractUrl = formData.contract_url;

      if (contractFile) {
        setIsUploading(true);
        const fileExt = contractFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('contract_files')
          .upload(filePath, contractFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('contract_files')
          .getPublicUrl(filePath);

        contractUrl = publicUrl;
        setIsUploading(false);
      }

      const shouldBlock = formData.status === 'confirmed' || formData.status === 'completed';
      const isPaidStatus = formData.payment_status === 'paid' || formData.payment_status === 'partial';
      const totalAfterDiscount = Math.max(0, formData.total_amount - formData.discount_amount);
      const depositAmount = Math.max(0, formData.deposit_amount || 0);

      if (isCreating) {
        if (!formData.guest_id || !formData.check_in || !formData.check_out) {
          toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
          return;
        }
        const createdReservation = await createReservation.mutateAsync({
          guest_id: formData.guest_id,
          check_in: formData.check_in,
          check_out: formData.check_out,
          num_guests: formData.num_guests,
          total_amount: formData.total_amount,
          deposit_amount: formData.deposit_amount,
          discount_amount: formData.discount_amount,
          status: formData.status,
          payment_status: formData.payment_status,
          notes: formData.notes,
          contract_url: contractUrl
        });

        if (createdReservation?.id && shouldBlock) {
          await upsertReservationBlockedDate.mutateAsync({
            reservation_id: createdReservation.id,
            start_date: formData.check_in,
            end_date: formData.check_out,
            reason: 'Reserva confirmada',
          });
        }

        if (createdReservation?.id && isPaidStatus) {
          const amount = formData.payment_status === 'partial'
            ? (depositAmount || totalAfterDiscount)
            : totalAfterDiscount;
          if (amount > 0) {
            await createPayment.mutateAsync({
              reservation_id: createdReservation.id,
              amount,
              payment_date: new Date().toISOString().split('T')[0],
              payment_method: 'manual',
              notes: formData.payment_status === 'partial'
                ? 'Pagamento parcial confirmado no cadastro'
                : 'Pagamento confirmado no cadastro',
            });
          }
        }
        toast({ title: "Reserva criada com sucesso" });
      } else if (editingReservation) {
        const wasBlocked =
          editingReservation.status === 'confirmed' || editingReservation.status === 'completed';
        const wasPaidStatus =
          editingReservation.payment_status === 'paid' || editingReservation.payment_status === 'partial';
        await updateReservation.mutateAsync({
          id: editingReservation.id,
          total_amount: formData.total_amount,
          deposit_amount: formData.deposit_amount,
          discount_amount: formData.discount_amount,
          status: formData.status,
          payment_status: formData.payment_status,
          notes: formData.notes,
          contract_url: contractUrl
        });

        if (shouldBlock) {
          await upsertReservationBlockedDate.mutateAsync({
            reservation_id: editingReservation.id,
            start_date: editingReservation.check_in,
            end_date: editingReservation.check_out,
            reason: 'Reserva confirmada',
          });
        } else if (wasBlocked && !shouldBlock) {
          await deleteBlockedDateByReservation.mutateAsync(editingReservation.id);
        }

        if (isPaidStatus && (!wasPaidStatus || formData.payment_status !== editingReservation.payment_status)) {
          const paidSoFar = await getPaidTotal(editingReservation.id);
          const partialTarget = depositAmount || totalAfterDiscount;
          const remainingAmount = Math.max(0, totalAfterDiscount - paidSoFar);
          const partialRemaining = Math.max(0, partialTarget - paidSoFar);
          const amount = formData.payment_status === 'partial'
            ? partialRemaining
            : remainingAmount;

          if (amount > 0) {
            await createPayment.mutateAsync({
              reservation_id: editingReservation.id,
              amount,
              payment_date: new Date().toISOString().split('T')[0],
              payment_method: 'manual',
              notes: formData.payment_status === 'partial'
                ? 'Pagamento parcial confirmado no cadastro'
                : 'Pagamento confirmado no cadastro',
            });
          }
        }
        toast({ title: "Reserva atualizada com sucesso" });
      }
      setIsDialogOpen(false);
      setEditingReservation(null);
      setContractFile(null);
    } catch (error) {
       setIsUploading(false);
       toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reservas</h1>
        <Button onClick={handleNewClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Reserva
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todas as Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hóspede</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations?.map((res) => (
                <TableRow key={res.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{res.guest?.full_name || 'Hóspede desconhecido'}</span>
                      {res.tracking_code && (
                        <span className="text-xs text-muted-foreground">
                          Código: {res.tracking_code}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{format(parseDateOnly(res.check_in), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(parseDateOnly(res.check_out), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        res.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {res.status === 'confirmed' ? 'Confirmada' : 
                       res.status === 'cancelled' ? 'Cancelada' : 
                       res.status === 'completed' ? 'Concluída' : 'Pendente'}
                    </span>
                  </TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 rounded text-xs font-semibold
                      ${res.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                        {res.payment_status === 'paid' ? 'Pago' : 
                         res.payment_status === 'partial' ? 'Parcial' : 'Pendente'}
                     </span>
                  </TableCell>
                  <TableCell>
                    {res.contract_url ? (
                      <a href={res.contract_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                        <Eye className="h-4 w-4" /> Ver
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(res)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteClick(res.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Nova Reserva' : 'Editar Reserva'}</DialogTitle>
            <DialogDescription>{isCreating ? 'Crie uma nova reserva' : 'Atualize a reserva'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-96 overflow-y-auto">
            {isCreating && (
              <>
                <div className="grid gap-1">
                  <Label htmlFor="guest">Hóspede</Label>
                  <Select value={formData.guest_id} onValueChange={(val) => setFormData({...formData, guest_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um hóspede" />
                    </SelectTrigger>
                    <SelectContent>
                      {guests?.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id}>
                          {guest.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="checkin">Check-in</Label>
                  <Input id="checkin" type="date" value={formData.check_in} onChange={(e) => setFormData({...formData, check_in: e.target.value})} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="checkout">Check-out</Label>
                  <Input id="checkout" type="date" value={formData.check_out} onChange={(e) => setFormData({...formData, check_out: e.target.value})} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="guests">Número de Hóspedes</Label>
                  <Input id="guests" type="number" min="1" value={formData.num_guests} onChange={(e) => setFormData({...formData, num_guests: parseInt(e.target.value)})} />
                </div>
              </>
            )}
            <div className="grid gap-1">
              <Label htmlFor="total">Valor Total</Label>
              <Input id="total" type="number" step="0.01" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="deposit">Valor da Entrada</Label>
              <Input id="deposit" type="number" step="0.01" value={formData.deposit_amount} onChange={(e) => setFormData({...formData, deposit_amount: parseFloat(e.target.value)})} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="discount">Desconto</Label>
              <Input id="discount" type="number" step="0.01" value={formData.discount_amount} onChange={(e) => setFormData({...formData, discount_amount: parseFloat(e.target.value)})} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="status" className="text-sm">Status</Label>
              <Select value={formData.status} onValueChange={(val: ReservationStatus) => setFormData({...formData, status: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="payment" className="text-sm">Pagamento</Label>
              <Select value={formData.payment_status} onValueChange={(val: PaymentStatus) => setFormData({...formData, payment_status: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Status de Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="notes" className="text-sm">Observações</Label>
              <Input id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="text-sm" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="contract" className="text-sm">Contrato Assinado (PDF/Imagem)</Label>
              <Input
                id="contract"
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setContractFile(e.target.files?.[0] || null)}
              />
              {formData.contract_url && (
                <div className="flex items-center gap-3">
                  <a href={formData.contract_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                    Ver contrato atual
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteContract}
                    disabled={isDeletingContract}
                  >
                    {isDeletingContract ? 'Excluindo...' : 'Excluir contrato'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? 'Criar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
