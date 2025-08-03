
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
import type { Contact } from '@/types';
import React, { useState, useEffect, useCallback } from 'react';
import { ContactForm } from './ContactForm';
import Link from 'next/link';
import { getContacts, addContact, deleteContact, updateContact, UpdateContactData } from '@/services/contacts';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const contactsData = await getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los contactos.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchContacts();
    } else if (!authLoading && !user) {
      setLoading(false);
      console.log("User not authenticated. Cannot fetch contacts.");
    }
  }, [authLoading, user, fetchContacts]);

  const handleSave = async (contactData: UpdateContactData) => {
    try {
      if (selectedContact) {
        await updateContact(selectedContact.id, contactData);
        toast({
            title: "Éxito",
            description: "El contacto se ha actualizado correctamente.",
        });
      } else {
        await addContact(contactData as Omit<Contact, 'id' | 'date' | 'interestedPropertyIds'>);
        toast({
            title: "Éxito",
            description: "El contacto se ha creado correctamente.",
        });
      }
      await fetchContacts(); // Refetch data
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

  const handleDeleteClick = (id: string) => {
    setContactToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (contactToDelete) {
        try {
            await deleteContact(contactToDelete);
            toast({
                title: "Éxito",
                description: "El contacto se ha eliminado correctamente.",
            });
            await fetchContacts();
        } catch (error) {
            console.error("Error deleting contact: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el contacto.",
            });
        } finally {
            setIsAlertOpen(false);
            setContactToDelete(null);
        }
    }
  };


  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el contacto de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContactToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ContactForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        contact={selectedContact}
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
                      <DropdownMenuItem onClick={() => handleDeleteClick(contact.id)} className="text-destructive">Eliminar</DropdownMenuItem>
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
                          <DropdownMenuItem onClick={() => handleDeleteClick(contact.id)} className="text-destructive">Eliminar</DropdownMenuItem>
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
