import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { usePropertySettings, useUpdatePropertySettings } from "@/hooks/usePropertySettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";

export default function Settings() {
  const { data: settings, isLoading } = usePropertySettings();
  const updateSettings = useUpdatePropertySettings();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_guests: 10,
    amenities: [] as string[],
    images: [] as string[]
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || '',
        description: settings.description || '',
        max_guests: settings.max_guests || 10,
        amenities: (settings.amenities as string[]) || [],
        images: (settings.images as string[]) || []
      });
      setMainImageUrl((settings.images as string[])?.[0] || '');
    }
  }, [settings]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `property/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      if (!mainImageUrl && uploadedUrls.length > 0) {
        setMainImageUrl(uploadedUrls[0]);
      }

      toast({ title: "Imagens enviadas com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao enviar imagens", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    if (formData.images[index] === mainImageUrl && formData.images.length > 0) {
      setMainImageUrl(formData.images[0]);
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      // Reorganizar imagens para que a principal seja a primeira
      const orderedImages = [
        mainImageUrl,
        ...formData.images.filter(img => img !== mainImageUrl)
      ].filter(Boolean);

      await updateSettings.mutateAsync({
        name: formData.name,
        description: formData.description,
        max_guests: formData.max_guests,
        amenities: formData.amenities,
        images: orderedImages
      });
      toast({ title: "Configurações salvas com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Propriedade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Nome da Propriedade</Label>
              <Input 
                id="propertyName" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Descreva o espaço..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGuests">Capacidade Máxima de Hóspedes</Label>
              <Input 
                id="maxGuests" 
                type="number"
                min="1"
                value={formData.max_guests}
                onChange={(e) => setFormData(prev => ({ ...prev, max_guests: parseInt(e.target.value) }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fotos do Imóvel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Foto Principal</Label>
              <p className="text-sm text-muted-foreground mb-2">Esta foto aparecerá na página inicial</p>
              {mainImageUrl ? (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                  <img src={mainImageUrl} alt="Principal" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                    Principal
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                  <p className="text-muted-foreground">Nenhuma foto principal definida</p>
                </div>
              )}
            </div>

            <div>
              <Label>Galeria de Fotos</Label>
              <p className="text-sm text-muted-foreground mb-2">Clique em uma foto para definir como principal</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {formData.images.map((img, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer border-2 rounded-lg overflow-hidden hover:border-primary transition"
                    onClick={() => setMainImageUrl(img)}
                  >
                    <img src={img} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover" />
                    {img === mainImageUrl && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                          Principal
                        </span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remover imagem"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" className="gap-2" disabled={uploading} asChild>
                    <span>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {uploading ? 'Enviando...' : 'Adicionar Fotos'}
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comodidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{amenity}</span>
                  <button onClick={() => handleRemoveAmenity(index)} className="hover:text-red-500" aria-label="Remover comodidade">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Wi-Fi, Churrasqueira, Piscina..."
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
              />
              <Button onClick={handleAddAmenity} variant="outline">Adicionar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newReservation" className="font-bold">Nova Reserva</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificação por email para cada nova reserva.
                </p>
              </div>
              <Switch id="newReservation" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cancellation" className="font-bold">Cancelamento</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificação por email quando uma reserva é cancelada.
                </p>
              </div>
              <Switch id="cancellation" />
            </div>
          </CardContent>
        </Card>
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}
