
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Contact, Property } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, User, Tag, FileText, Home, Edit, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getContactById } from '@/services/contacts';
import { getContactProperties, disassociatePropertyFromContact } from '@/services/contacts';
import { AssociatePropertyForm } from './AssociatePropertyForm';
import { useToast } from '@/hooks/use-toast';

const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}


function PropertyListView({ properties, onDisassociate }: { properties: Property[], onDisassociate: (propertyId: string) => void }) {
    if (properties.length === 0) {
        return <p className="text-muted-foreground text-sm">No hay propiedades para mostrar.</p>;
    }

    return (
        <>
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {properties.map((property) => (
                    <Card key={property.id}>
                        <CardHeader>
                            <CardTitle className="text-base">
                                <Link href={`/admin/properties?edit=${property.id}`} className="font-bold hover:underline">
                                    {property.title}
                                </Link>
                            </CardTitle>
                            <CardDescription className="capitalize">
                                {property.modality} - ${Number(property.priceUSD).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-between">
                            <Button variant="destructive" size="sm" onClick={() => onDisassociate(property.id)}>
                                <X className="mr-2 h-4 w-4" /> Desasociar
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/properties?edit=${property.id}`}>Ver Detalles</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Modalidad</TableHead>
                            <TableHead>Precio (USD)</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {properties.map((property) => (
                            <TableRow key={property.id}>
                                <TableCell>
                                    <Link href={`/admin/properties?edit=${property.id}`} className="font-bold hover:underline">
                                        {property.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">{property.address}</p>
                                </TableCell>
                                <TableCell className="capitalize">{property.modality}</TableCell>
                                <TableCell>${Number(property.priceUSD).toLocaleString()}</TableCell>
                                <TableCell className="space-x-2">
                                    <Button variant="destructive" size="sm" onClick={() => onDisassociate(property.id)}>
                                        <X className="mr-2 h-4 w-4" />
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/properties?edit=${property.id}`}>Ver</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}

interface ContactDetailsClientViewProps {
  contactId: string;
  onClose?: () => void;
  onEdit?: (contact: Contact) => void;
}

export function ContactDetailsClientView({ contactId, onClose, onEdit }: ContactDetailsClientViewProps) {
  const [contact, setContact] = useState<Contact | undefined>(undefined);
  const [ownedProperties, setOwnedProperties] = useState<Property[]>([]);
  const [interestedProperties, setInterestedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssociateFormOpen, setIsAssociateFormOpen] = useState(false);
  const { toast } = useToast();
  
  const fetchContactData = async () => {
    setLoading(true);
    const contactData = await getContactById(contactId);
    if (contactData) {
        setContact(contactData);
        const { owned, interested } = await getContactProperties(contactData);
        setOwnedProperties(owned);
        setInterestedProperties(interested);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContactData();
  }, [contactId]);

  const handleAssociationSaved = () => {
      fetchContactData(); // Refetch all data
  };
  
  const handleDisassociate = async (propertyId: string) => {
    if (!contact) return;
    try {
      await disassociatePropertyFromContact(contact.id, propertyId);
      toast({ title: "Éxito", description: "Propiedad desasociada correctamente." });
      fetchContactData(); // Refetch
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo desasociar la propiedad." });
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Cargando contacto...</h1>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Contacto no encontrado</h1>
        <Button asChild>
          <Link href="/admin/contacts">
            <ArrowLeft className="mr-2" /> Volver a Contactos
          </Link>
        </Button>
      </div>
    );
  }

  const BackButton = () => (
    <Button asChild variant="outline" size="sm" onClick={onClose}>
        {onClose ? (
            <span className='flex items-center cursor-pointer'><ArrowLeft className="mr-2" /> Volver a Contactos</span>
        ) : (
            <Link href="/admin/contacts"><ArrowLeft className="mr-2" /> Volver a Contactos</Link>
        )}
    </Button>
  );

  return (
    <>
        <AssociatePropertyForm 
            isOpen={isAssociateFormOpen}
            onClose={() => setIsAssociateFormOpen(false)}
            onAssociationSaved={handleAssociationSaved}
            contact={contact}
        />
        <div className="flex justify-between items-center mb-6">
            <BackButton />
            <div className="flex gap-2">
                 <Button size="sm" variant="outline" onClick={() => setIsAssociateFormOpen(true)}>
                    <Home className="mr-2 h-4 w-4" /> Asociar a Propiedad
                </Button>
                {onEdit && (
                    <Button size="sm" onClick={() => onEdit(contact)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar Contacto
                    </Button>
                )}
            </div>
        </div>

        <div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <CardTitle className="font-headline text-2xl flex items-center gap-3">
                               <User /> {getFullName(contact)}
                            </CardTitle>
                            <CardDescription>Detalles del contacto y actividad.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3"><Mail className="text-muted-foreground" size={20} /><a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email || 'No disponible'}</a></div>
                        {contact.phone && (<div className="flex items-center gap-3"><Phone className="text-muted-foreground" size={20} /><span>{contact.phone}</span></div>)}
                        <div className="flex items-start gap-3"><Tag className="text-muted-foreground mt-1" size={20} /><div className="flex flex-wrap gap-2">{contact.types.map(type => (<Badge key={type} variant="secondary" className="capitalize text-sm">{type}</Badge>))}</div></div>
                    </div>
                    <div className="space-y-2 pt-6 border-t mt-6">
                        <h4 className="font-semibold flex items-center gap-2 text-lg"><FileText size={20}/> Notas</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-md">{contact.notes || 'No hay notas para este contacto.'}</p>
                    </div>
                </CardContent>
            </Card>
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><Home size={24}/> Propiedades en Posesión</h2>
                <PropertyListView properties={ownedProperties} onDisassociate={handleDisassociate} />
            </div>

            <div className="mt-8">
                 <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><Home size={24}/> Propiedades de Interés</h2>
                <PropertyListView properties={interestedProperties} onDisassociate={handleDisassociate} />
            </div>
        </div>
    </>
  );
}
