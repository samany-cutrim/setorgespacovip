import { useState } from 'react';
import { useAudiencias, useCreateAudiencia, useUpdateAudiencia, useDeleteAudiencia } from '@/hooks/useAudiencias';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Pencil, Trash2, Gavel, Loader2, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AudienciaTRT, HearingStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function AdminAudienciasTRT() {
  const { toast } = useToast();
  const [advogadoFilter, setAdvogadoFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { data: audiencias = [], isLoading, refetch } = useAudiencias(advogadoFilter);
  const createAudiencia = useCreateAudiencia();
  const updateAudiencia = useUpdateAudiencia();
  const deleteAudiencia = useDeleteAudiencia();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAudiencia, setEditingAudiencia] = useState<AudienciaTRT | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    numero_processo: '',
    advogado_parte: '',
    data_audiencia: '',
    hora_audiencia: '',
    tipo_audiencia: '',
    tribunal: '',
    vara: '',
    local: '',
    status: 'agendada' as HearingStatus,
    advogado_responsavel: '',
    observacoes: '',
  });

  const handleSearch = () => {
    setAdvogadoFilter(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAdvogadoFilter('');
  };

  const openDialog = (audiencia?: AudienciaTRT) => {
    if (audiencia) {
      setEditingAudiencia(audiencia);
      setFormData({
        numero_processo: audiencia.numero_processo,
        advogado_parte: audiencia.advogado_parte,
        data_audiencia: format(parseISO(audiencia.data_audiencia), 'yyyy-MM-dd'),
        hora_audiencia: audiencia.hora_audiencia || '',
        tipo_audiencia: audiencia.tipo_audiencia || '',
        tribunal: audiencia.tribunal || '',
        vara: audiencia.vara || '',
        local: audiencia.local || '',
        status: audiencia.status,
        advogado_responsavel: audiencia.advogado_responsavel || '',
        observacoes: audiencia.observacoes || '',
      });
    } else {
      setEditingAudiencia(null);
      setFormData({
        numero_processo: '',
        advogado_parte: '',
        data_audiencia: '',
        hora_audiencia: '',
        tipo_audiencia: '',
        tribunal: '',
        vara: '',
        local: '',
        status: 'agendada',
        advogado_responsavel: '',
        observacoes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const audienciaData = {
      ...formData,
      data_audiencia: new Date(formData.data_audiencia).toISOString(),
    };

    try {
      if (editingAudiencia) {
        await updateAudiencia.mutateAsync({
          id: editingAudiencia.id,
          ...audienciaData,
        });
        toast({
          title: 'Audiência atualizada',
          description: 'A audiência foi atualizada com sucesso.',
        });
      } else {
        await createAudiencia.mutateAsync(audienciaData);
        toast({
          title: 'Audiência criada',
          description: 'A nova audiência foi criada com sucesso.',
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar a audiência.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteAudiencia.mutateAsync(deleteId);
      toast({
        title: 'Audiência excluída',
        description: 'A audiência foi excluída com sucesso.',
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a audiência.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: HearingStatus) => {
    const variants: Record<HearingStatus, { variant: "default" | "secondary" | "destructive" | "outline", text: string }> = {
      agendada: { variant: 'default', text: 'Agendada' },
      cancelada: { variant: 'destructive', text: 'Cancelada' },
      redesignada: { variant: 'secondary', text: 'Redesignada' },
      realizada: { variant: 'outline', text: 'Realizada' },
    };
    
    const { variant, text } = variants[status];
    return <Badge variant={variant}>{text}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gavel className="h-8 w-8" />
            Audiências TRT
          </h1>
          <p className="text-muted-foreground mt-1">
            Consulte e gerencie audiências dos TRTs
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Audiência
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Audiências</CardTitle>
          <CardDescription>
            Digite o nome do advogado para filtrar as audiências
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Nome do advogado..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="default">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            {advogadoFilter && (
              <Button onClick={handleClearSearch} variant="outline">
                Limpar
              </Button>
            )}
            <Button onClick={() => refetch()} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {advogadoFilter && (
            <p className="text-sm text-muted-foreground mt-2">
              Filtrando por advogado: <strong>{advogadoFilter}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Audiências</CardTitle>
          <CardDescription>
            {audiencias.length} audiência(s) encontrada(s)
            {advogadoFilter && ` para o advogado ${advogadoFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : audiencias.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma audiência encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Processo</TableHead>
                    <TableHead>Advogado Parte</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tribunal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Advogado Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audiencias.map((audiencia) => (
                    <TableRow key={audiencia.id}>
                      <TableCell className="font-mono text-xs">
                        {audiencia.numero_processo}
                      </TableCell>
                      <TableCell>{audiencia.advogado_parte}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(parseISO(audiencia.data_audiencia), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          {audiencia.hora_audiencia && (
                            <span className="text-xs text-muted-foreground">{audiencia.hora_audiencia}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{audiencia.tipo_audiencia || '-'}</TableCell>
                      <TableCell>{audiencia.tribunal || '-'}</TableCell>
                      <TableCell>{getStatusBadge(audiencia.status)}</TableCell>
                      <TableCell>
                        {audiencia.advogado_responsavel || (
                          <span className="text-muted-foreground text-xs">Não atribuído</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDialog(audiencia)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setDeleteId(audiencia.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAudiencia ? 'Editar Audiência' : 'Nova Audiência'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da audiência do TRT
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero_processo">Número do Processo *</Label>
                  <Input
                    id="numero_processo"
                    value={formData.numero_processo}
                    onChange={(e) => setFormData({ ...formData, numero_processo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advogado_parte">Advogado da Parte *</Label>
                  <Input
                    id="advogado_parte"
                    value={formData.advogado_parte}
                    onChange={(e) => setFormData({ ...formData, advogado_parte: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_audiencia">Data da Audiência *</Label>
                  <Input
                    id="data_audiencia"
                    type="date"
                    value={formData.data_audiencia}
                    onChange={(e) => setFormData({ ...formData, data_audiencia: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_audiencia">Hora da Audiência</Label>
                  <Input
                    id="hora_audiencia"
                    type="time"
                    value={formData.hora_audiencia}
                    onChange={(e) => setFormData({ ...formData, hora_audiencia: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_audiencia">Tipo de Audiência</Label>
                  <Input
                    id="tipo_audiencia"
                    value={formData.tipo_audiencia}
                    onChange={(e) => setFormData({ ...formData, tipo_audiencia: e.target.value })}
                    placeholder="Ex: Inicial, Instrução, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tribunal">Tribunal</Label>
                  <Input
                    id="tribunal"
                    value={formData.tribunal}
                    onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })}
                    placeholder="Ex: TRT 2ª Região"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vara">Vara</Label>
                  <Input
                    id="vara"
                    value={formData.vara}
                    onChange={(e) => setFormData({ ...formData, vara: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: HearingStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendada">Agendada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="redesignada">Redesignada</SelectItem>
                      <SelectItem value="realizada">Realizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  placeholder="Endereço do local da audiência"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advogado_responsavel">Advogado Responsável</Label>
                <Input
                  id="advogado_responsavel"
                  value={formData.advogado_responsavel}
                  onChange={(e) => setFormData({ ...formData, advogado_responsavel: e.target.value })}
                  placeholder="Nome do advogado que comparecerá"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais sobre a audiência"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAudiencia.isPending || updateAudiencia.isPending}>
                {(createAudiencia.isPending || updateAudiencia.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingAudiencia ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta audiência? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
