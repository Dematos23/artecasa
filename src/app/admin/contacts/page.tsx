
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
import React, { useState, useEffect, useCallback } from 'react';
import { ContactForm } from './ContactForm';
import Link from 'next/link';
import { getContacts, addContact } from '@/services/contacts';
import { getProperties } from '@/services/properties';
import { useToast } from '@/hooks/use-toast';

const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContactsAndProperties = useCallback(async () => {
    try {
      setLoading(true);
      const [contactsData, propertiesData] = await Promise.all([
        getContacts(),
        getProperties(),
      ]);
      setContacts(contactsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContactsAndProperties();
  }, [fetchContactsAndProperties]);

  const handleSave = async (contactData: Omit<Contact, 'id' | 'date'>) => {
    try {
      if (selectedContact) {
        // TODO: Implement edit logic
        // const updatedContact = { ...selectedContact, ...contactData };
        // setContacts(contacts.map(c => c.id === selectedContact.id ? updatedContact : c));
      } else {
        await addContact(contactData);
        toast({
            title: "Éxito",
            description: "El contacto se ha creado correctamente.",
        });
      }
      await fetchContactsAndProperties(); // Refetch data
      setIsFormOpen(false);
      setSelectedContact(undefined);
    } catch (error) {
       console.error("Error guardando contacto: ", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el contacto.",
      });
    }
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
    // TODO: Implement Firestore delete logic
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

       {loading ? (
        <p>Cargando contactos...</p>
      ) : (
        <>
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
      )}
    </>
  );
}
