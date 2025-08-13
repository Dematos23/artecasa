
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
import { MoreHorizontal, PlusCircle, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Contact } from '@/types';
import { contactTypes } from '@/types';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ContactForm } from './ContactForm';
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
import { ContactDetailsClientView } from './ContactDetailsClientView';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenant } from '@/context/TenantContext';


const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}

export default function AdminContactsPage() {
  const { tenantId } = useTenant();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [viewingContactId, setViewingContactId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');


  const fetchContacts = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const contactsData = await getContacts(tenantId);
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
  }, [toast, tenantId]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchContacts();
    } else if (!authLoading && !user) {
      setLoading(false);
      console.log("User not authenticated. Cannot fetch contacts.");
    }
  }, [authLoading, user, fetchContacts]);
  
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const searchMatch = (() => {
        if (!searchQuery) return true;
        const lowercasedQuery = searchQuery.toLowerCase();
        const fullName = getFullName(contact).toLowerCase();
        const email = contact.email?.toLowerCase() || '';
        const phone = contact.phone?.toLowerCase() || '';
        return fullName.includes(lowercasedQuery) || email.includes(lowercasedQuery) || phone.includes(lowercasedQuery);
      })();

      const typeMatch = typeFilter === 'all' || (contact.types && contact.types.includes(typeFilter as any));

      return searchMatch && typeMatch;
    });
  }, [contacts, searchQuery, typeFilter]);

  const handleSave = async (contactData: UpdateContactData) => {
    if (!tenantId) return;
    try {
      if (selectedContact) {
        await updateContact(tenantId, selectedContact.id, contactData);
        toast({
            title: "Éxito",
            description: "El contacto se ha actualizado correctamente.",
        });
      } else {
        await addContact(tenantId, contactData as Omit<Contact, 'id' | 'date' | 'interestedInPropertyIds' | 'ownerOfPropertyIds'>);
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
    setViewingContactId(null);
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
    if (contactToDelete && tenantId) {
        try {
            await deleteContact(tenantId, contactToDelete);
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

  const handleViewDetails = (id: string) => {
    setViewingContactId(id);
  }

  const handleCloseDetails = () => {
    setViewingContactId(null);
  }

  const handleNavigateToProperty = (propertyId: string) => {
    router.push(`/admin/properties?edit=${propertyId}`);
  }

  if (loading) {
      return null;
  }


  if (viewingContactId) {
    return <ContactDetailsClientView contactId={viewingContactId} onClose={handleCloseDetails} onEdit={openFormForEdit} onNavigateToProperty={handleNavigateToProperty} />;
  }


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

        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
                <h1 className="text-2xl font-bold font-headline">Formularios de Contacto</h1>
                <p className="text-muted-foreground">Ver y gestionar las consultas de clientes potenciales.</p>
            </div>
            <Button onClick={openFormForCreate} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Contacto
            </Button>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre, correo o teléfono..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                />
              </div>
               <div className='w-full sm:w-48'>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Tipos</SelectItem>
                    {contactTypes.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>

          <>
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
                {filteredContacts.map((contact) => (
                <Card key={contact.id}>
                  <CardHeader>
                    <CardTitle className="text-base truncate">
                      <span className="font-bold cursor-pointer" onClick={() => handleViewDetails(contact.id)}>{getFullName(contact)}</span>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(contact.id)}>Ver Detalles</DropdownMenuItem>
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
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                         <span className="font-bold cursor-pointer" onClick={() => handleViewDetails(contact.id)}>{getFullName(contact)}</span>
                      </TableCell>
                      <TableCell>{contact.email || '-'}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(contact.id)}>Ver Detalles</DropdownMenuItem>
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
             {filteredContacts.length === 0 && !loading && (
                  <div className="text-center py-16">
                      <p className="text-muted-foreground">
                          {searchQuery || typeFilter !== 'all' ? "No se encontraron contactos que coincidan con tu búsqueda." : "Aún no hay contactos para mostrar."}
                      </p>
                  </div>
              )}
          </>
        </>
    </>
  );
}
