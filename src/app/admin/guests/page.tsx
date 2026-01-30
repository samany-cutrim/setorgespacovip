import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Guests() {
  // Mock data
  const guests = [
    { id: 'GST001', name: 'João Silva', email: 'joao.silva@example.com', avatar: '/avatars/01.png' },
    { id: 'GST002', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', avatar: '/avatars/02.png' },
    { id: 'GST003', name: 'Carlos Pereira', email: 'carlos.pereira@example.com', avatar: '/avatars/03.png' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hóspedes</h1>
        <Button>Novo Hóspede</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todos os Hóspedes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>{guest.id}</TableCell>
                  <TableCell className="flex items-center">
                    <Avatar className="h-9 w-9 mr-4">
                      <AvatarImage src={guest.avatar} alt="Avatar" />
                      <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {guest.name}
                  </TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Ver Perfil</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
