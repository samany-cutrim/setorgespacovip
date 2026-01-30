import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReservations, useUpdateReservation, useDeleteReservation } from '@/hooks/useReservations';
import { Reservation, ReservationStatus, PaymentStatus } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';

export default function Reservations() {
  const { data: reservations, isLoading } = useReservations();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const { toast } = useToast();

  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    status: 'pending' as ReservationStatus,
    payment_status: 'pending' as PaymentStatus,
    notes: ''
  });

  const handleEditClick = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      status: reservation.status,
      payment_status: reservation.payment_status,
      notes: reservation.notes || ''
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

  const handleSave = async () => {
    if (!editingReservation) return;

    try {
      await updateReservation.mutateAsync({
        id: editingReservation.id,
        status: formData.status,
        payment_status: formData.payment_status,
        notes: formData.notes
      });
      toast({ title: "Reserva atualizada com sucesso" });
      setIsDialogOpen(false);
      setEditingReservation(null);
    } catch (error) {
       toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reservas</h1>
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations?.map((res) => (
                <TableRow key={res.id}>
                  <TableCell>{res.guest?.full_name || 'Hóspede desconhecido'}</TableCell>
                  <TableCell>{format(new Date(res.check_in), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(res.check_out), 'dd/MM/yyyy')}</TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>Atualize o status e detalhes da reserva.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val: ReservationStatus) => setFormData({...formData, status: val})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_status" className="text-right">Pagamento</Label>
              <Select 
                value={formData.payment_status} 
                onValueChange={(val: PaymentStatus) => setFormData({...formData, payment_status: val})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Status do pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Observações</Label>
              <Input 
                id="notes" 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
