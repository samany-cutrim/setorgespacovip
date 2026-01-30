import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Reservations() {
  // Mock data
  const reservations = [
    { id: 'RES001', guest: 'João Silva', checkIn: '2024-02-10', checkOut: '2024-02-15', status: 'Confirmada' },
    { id: 'RES002', guest: 'Maria Oliveira', checkIn: '2024-02-12', checkOut: '2024-02-14', status: 'Pendente' },
    { id: 'RES003', guest: 'Carlos Pereira', checkIn: '2024-02-18', checkOut: '2024-02-20', status: 'Cancelada' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reservas</h1>
        <Button>Nova Reserva</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todas as Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Hóspede</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((res) => (
                <TableRow key={res.id}>
                  <TableCell>{res.id}</TableCell>
                  <TableCell>{res.guest}</TableCell>
                  <TableCell>{res.checkIn}</TableCell>
                  <TableCell>{res.checkOut}</TableCell>
                  <TableCell>{res.status}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Detalhes</Button>
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
