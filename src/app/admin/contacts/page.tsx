
"use client";

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
import type { Contact, Property } from '@/types';
import React, { useState } from 'react';
import { ContactForm } from './ContactForm';
import Link from 'next/link';


const dummyContacts: Contact[] = [
  { id: '1', firstname: 'John', firstlastname: 'Doe', email: 'john.doe@example.com', notes: 'I am interested in the Modern Villa. Can I get more details?', date: '2024-05-20', types: ['comprador'], phone: '987654321', interestedPropertyIds: ['1', '2'] },
  { id: '2', firstname: 'Jane', firstlastname: 'Smith', email: 'jane.smith@example.com', notes: 'Please schedule a viewing for the Downtown Penthouse.', date: '2024-05-19', types: ['arrendatario'], phone: '987654322', interestedPropertyIds: ['3'] },
  { id: '3', firstname: 'Sam', firstlastname: 'Wilson', email: 'sam.wilson@example.com', notes: 'What are the financing options available?', date: '2024-05-18', types: ['vendedor', 'arrendador'], phone: '987654323' },
];

const dummyProperties: Property[] = [
  { id: '1', title: 'Villa Moderna en Condominio Privado', price: '2,500,000', modality: 'venta', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, area_m2: 5800, imageUrls: [], featured: true, ownerId: '3' },
  { id: '2', title: 'Penthouse en el Centro con Vistas a la Ciudad', price: '3,200,000', modality: 'venta', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, area_m2: 3500, imageUrls: [], featured: true, ownerId: '3' },
  { id: '3', title: 'Acogedora Casa de Playa', price: '1,800,000', modality: 'alquiler', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, area_m2: 2200, imageUrls: [], featured: false, ownerId: '3' },
];


const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(dummyContacts);
  const [properties, setProperties] = useState<Property[]>(dummyProperties);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);

  const handleSave = (contactData: Omit<Contact, 'id' | 'date'>) => {
    if (selectedContact) {
      // Edit
      const updatedContact = { ...selectedContact, ...contactData };
      setContacts(contacts.map(c => c.id === selectedContact.id ? updatedContact : c));
    } else {
      // Create
      const newContact = { ...contactData, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] };
      setContacts([...contacts, newContact]);
    }
    setIsFormOpen(false);
    setSelectedContact(undefined);
  };

  const openFormForEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsFormOpen(true);
  };

  const openFormForCreate = () => {
    setSelectedContact(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };


  return (
    <>
      <ContactForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        contact={selectedContact}
        properties={properties}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold font-headline">Formularios de Contacto</h1>
            <p className="text-muted-foreground">Ver y gestionar las consultas de clientes potenciales.</p>
        </div>
        <Button onClick={openFormForCreate} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Contacto
        </Button>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
          {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader>
              <CardTitle className="text-base truncate">
                <Link href={`/admin/contacts/${contact.id}`} className="font-bold">
                    {getFullName(contact)}
                </Link>
              </CardTitle>
              <CardDescription>{contact.email}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div className="flex gap-1 flex-wrap">
                  {contact.types.map(type => (
                      <Badge key={type} variant="secondary" className="capitalize">{type}</Badge>
                  ))}
                </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openFormForEdit(contact)}>Editar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
          ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/contacts/${contact.id}`} className="font-bold">
                    {getFullName(contact)}
                  </Link>
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {contact.types.map(type => (
                        <Badge key={type} variant="secondary" className="capitalize">{type}</Badge>
                    ))}
                  </div>
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
                      <DropdownMenuItem onClick={() => openFormForEdit(contact)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
