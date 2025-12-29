import { useState } from 'react';
import { useAllPricingRules, useCreatePricingRule, useUpdatePricingRule, useDeletePricingRule } from '@/hooks/usePricingRules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, DollarSign, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { PricingRule, PriceType } from '@/lib/types';

const priceTypeLabels: Record<PriceType, string> = {
  base: 'Diária Padrão',
  weekend: 'Final de Semana',
  holiday: 'Feriado',
  high_season: 'Alta Temporada',
  package: 'Pacote',
};

const priceTypeColors: Record<PriceType, string> = {
  base: 'bg-primary/10 text-primary border-primary/20',
  weekend: 'bg-accent/10 text-accent border-accent/20',
  holiday: 'bg-warning/10 text-warning border-warning/20',
  high_season: 'bg-destructive/10 text-destructive border-destructive/20',
  package: 'bg-success/10 text-success border-success/20',
};

export default function AdminPricing() {
  const { toast } = useToast();
  const { data: pricingRules = [], isLoading } = useAllPricingRules();
  const createPricingRule = useCreatePricingRule();
  const updatePricingRule = useUpdatePricingRule();
  const deletePricingRule = useDeletePricingRule();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price_type: 'base' as PriceType,
    daily_rate: '',
    min_nights: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const handleOpenDialog = (rule?: PricingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        price_type: rule.price_type,
        daily_rate: String(rule.daily_rate),
        min_nights: rule.min_nights ? String(rule.min_nights) : '',
        start_date: rule.start_date || '',
        end_date: rule.end_date || '',
        is_active: rule.is_active,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        price_type: 'base',
        daily_rate: '',
        min_nights: '',
        start_date: '',
        end_date: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      price_type: formData.price_type,
      daily_rate: parseFloat(formData.daily_rate),
      min_nights: formData.min_nights ? parseInt(formData.min_nights) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
    };

    try {
      if (editingRule) {
        await updatePricingRule.mutateAsync({ id: editingRule.id, ...data });
        toast({ title: 'Regra atualizada' });
      } else {
        await createPricingRule.mutateAsync(data);
        toast({ title: 'Regra criada' });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePricingRule.mutateAsync(deleteId);
      toast({ title: 'Regra excluída' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (rule: PricingRule) => {
    try {
      await updatePricingRule.mutateAsync({ id: rule.id, is_active: !rule.is_active });
      toast({ title: rule.is_active ? 'Regra desativada' : 'Regra ativada' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Preços</h1>
          <p className="text-muted-foreground">
            Configure diárias, pacotes e preços especiais
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regras de Preço</CardTitle>
          <CardDescription>
            Configure diferentes valores para finais de semana, feriados, temporadas e pacotes promocionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pricingRules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nenhuma regra de preço</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor/Diária</TableHead>
                    <TableHead>Min. Noites</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingRules.map((rule) => (
                    <TableRow key={rule.id} className={!rule.is_active ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priceTypeColors[rule.price_type]}>
                          {priceTypeLabels[rule.price_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        R$ {Number(rule.daily_rate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{rule.min_nights || '-'}</TableCell>
                      <TableCell>
                        {rule.start_date && rule.end_date ? (
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(rule.start_date), 'dd/MM/yy')} - {format(parseISO(rule.end_date), 'dd/MM/yy')}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => handleToggleActive(rule)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(rule)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(rule.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Editar Regra' : 'Nova Regra de Preço'}</DialogTitle>
            <DialogDescription>Configure os detalhes da regra</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Diária padrão, Pacote 7 noites..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_type">Tipo *</Label>
              <Select
                value={formData.price_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, price_type: value as PriceType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Diária Padrão</SelectItem>
                  <SelectItem value="weekend">Final de Semana</SelectItem>
                  <SelectItem value="holiday">Feriado</SelectItem>
                  <SelectItem value="high_season">Alta Temporada</SelectItem>
                  <SelectItem value="package">Pacote Promocional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_rate">Valor por Diária *</Label>
              <Input
                id="daily_rate"
                type="number"
                step="0.01"
                value={formData.daily_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, daily_rate: e.target.value }))}
                required
              />
            </div>
            {formData.price_type === 'package' && (
              <div className="space-y-2">
                <Label htmlFor="min_nights">Mínimo de Noites</Label>
                <Input
                  id="min_nights"
                  type="number"
                  value={formData.min_nights}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_nights: e.target.value }))}
                  placeholder="Ex: 7"
                />
              </div>
            )}
            {['holiday', 'high_season'].includes(formData.price_type) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Regra ativa</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
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
