import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';


const dummyContacts = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', message: 'I am interested in the Modern Villa. Can I get more details?', date: '2024-05-20', status: 'New' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', message: 'Please schedule a viewing for the Downtown Penthouse.', date: '2024-05-19', status: 'Contacted' },
  { id: '3', name: 'Sam Wilson', email: 'sam.wilson@example.com', message: 'What are the financing options available?', date: '2024-05-18', status: 'Resolved' },
];

export default function AdminContactsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Contact Submissions</CardTitle>
        <CardDescription>View and manage inquiries from potential clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.date}</TableCell>
                 <TableCell>
                  <Badge variant={contact.status === 'New' ? 'destructive' : 'outline'}>
                    {contact.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Message</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Contacted</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
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
