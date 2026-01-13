import { useState, useEffect } from 'react';
import { usePropertySettings } from '@/hooks/usePropertySettings';
// ...supabase removido...
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Settings, Image, Save, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: property, isLoading } = usePropertySettings();
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_guests: 10,
    amenities: [] as string[],
    images: [] as string[],
  });
  const [amenitiesInput, setAmenitiesInput] = useState('');

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        description: property.description || '',
        max_guests: property.max_guests || 10,
        amenities: property.amenities || [],
        images: property.images || [],
      });
      setAmenitiesInput((property.amenities || []).join(', '));
    }
  }, [property]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const amenities = amenitiesInput
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      if (property?.id) {
        // ...remover chamada ao supabase, substituir por chamada à nova API REST...
          .from('property_settings')
          .update({
            name: formData.name,
            description: formData.description,
            max_guests: formData.max_guests,
            amenities,
            images: formData.images,
          })
          .eq('id', property.id);

        if (error) throw error;
      } else {
        // ...remover chamada ao supabase, substituir por chamada à nova API REST...
          .from('property_settings')
          .insert({
            name: formData.name,
            description: formData.description,
            max_guests: formData.max_guests,
            amenities,
            images: formData.images,
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['property-settings'] });
      toast({
        title: 'Configurações salvas',
        description: 'As informações da propriedade foram atualizadas.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as informações e fotos da sua propriedade
        </p>
      </div>

      <div className="grid gap-6">
        {/* Property Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Settings className="h-5 w-5 text-primary" />
              Informações da Propriedade
            </CardTitle>
            <CardDescription>
              Dados que serão exibidos na página pública
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Propriedade</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="setor g espaço vip"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_guests">Máximo de Hóspedes</Label>
                <Input
                  id="max_guests"
                  type="number"
                  min={1}
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva sua propriedade..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Comodidades</Label>
              <Input
                id="amenities"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                placeholder="Piscina, Churrasqueira, Wi-Fi, Estacionamento"
              />
              <p className="text-xs text-muted-foreground">
                Separe cada comodidade por vírgula
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Image className="h-5 w-5 text-primary" />
              Galeria de Fotos
            </CardTitle>
            <CardDescription>
              Adicione fotos da sua propriedade para exibir na página pública
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
