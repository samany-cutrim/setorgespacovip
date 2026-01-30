import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Propriedade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Nome da Propriedade</Label>
              <Input id="propertyName" defaultValue="Setor G Espaço VIP" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de Contato</Label>
              <Input id="contactEmail" type="email" defaultValue="contato@setorgvip.com" />
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
        <Button>Salvar Alterações</Button>
      </div>
    </div>
  );
}
