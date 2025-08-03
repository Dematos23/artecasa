import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';


const dummyContacts = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', message: 'I am interested in the Modern Villa. Can I get more details?', date: '2024-05-20', status: 'Nuevo' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', message: 'Please schedule a viewing for the Downtown Penthouse.', date: '2024-05-19', status: 'Contactado' },
  { id: '3', name: 'Sam Wilson', email: 'sam.wilson@example.com', message: 'What are the financing options available?', date: '2024-05-18', status: 'Resuelto' },
];

export default function AdminContactsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">Formularios de Contacto</CardTitle>
                <CardDescription>Ver y gestionar las consultas de clientes potenciales.</CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Contacto
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.date}</TableCell>
                 <TableCell>
                  <Badge variant={contact.status === 'Nuevo' ? 'destructive' : 'outline'}>
                    {contact.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver Mensaje</DropdownMenuItem>
                      <DropdownMenuItem>Marcar como Contactado</DropdownMenuItem>
                      <DropdownMenuItem>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
