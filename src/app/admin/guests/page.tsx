import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGuests, useUpdateGuest, useDeleteGuest, useCreateGuest } from '@/hooks/useGuests';
import { Guest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, FileText, Upload, Loader2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Guests() {
  const { data: guests, isLoading } = useGuests();
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();
  const createGuest = useCreateGuest();
  const { toast } = useToast();

  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    notes: '',
    contract_url: ''
  });

  const handleCreateClick = () => {
    setEditingGuest(null);
    setContractFile(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      notes: '',
      contract_url: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (guest: Guest) => {
    setEditingGuest(guest);
    setContractFile(null);
    setFormData({
      full_name: guest.full_name,
      email: guest.email || '',
      phone: guest.phone || '',
      notes: guest.notes || '',
      contract_url: guest.contract_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este hóspede?")) {
      try {
        await deleteGuest.mutateAsync(id);
        toast({ title: "Hóspede removido com sucesso" });
      } catch (error) {
        toast({ title: "Erro ao remover", variant: "destructive" });
      }
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

      const guestData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        contract_url: contractUrl
      };

      if (editingGuest) {
        await updateGuest.mutateAsync({
          id: editingGuest.id,
          ...guestData
        });
        toast({ title: "Hóspede atualizado com sucesso" });
      } else {
        await createGuest.mutateAsync({
          ...guestData,
          document: null
        });
        toast({ title: "Hóspede criado com sucesso" });
      }

      setIsDialogOpen(false);
      setEditingGuest(null);
      setContractFile(null);
    } catch (error) {
       console.error(error);
       setIsUploading(false);
       toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hóspedes</h1>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" /> Novo Hóspede
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todos os Hóspedes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests?.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {guest.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{guest.full_name}</span>
                        <span className="text-xs text-muted-foreground">{guest.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{guest.notes || '-'}</TableCell>
                  <TableCell>
                    {guest.contract_url ? (
                      <a href={guest.contract_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                        <Eye className="h-4 w-4" /> Ver
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(guest)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteClick(guest.id)}>
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
            <DialogTitle>{editingGuest ? 'Editar Hóspede' : 'Novo Hóspede'}</DialogTitle>
            <DialogDescription>{editingGuest ? 'Atualize os dados' : 'Insira os dados'} do hóspede.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Input 
                id="notes" 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contract">Contrato Assinado (PDF/Imagem)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="contract" 
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                />
              </div>
              {formData.contract_url && (
                <a href={formData.contract_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                  Ver contrato atual
                </a>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
