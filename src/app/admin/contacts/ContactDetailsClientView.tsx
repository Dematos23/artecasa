
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Contact, Property } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, User, Tag, FileText, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getContactById } from '@/services/contacts';
import { getPropertiesByIds, getPropertiesByOwnerId } from '@/services/properties';

const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}


function PropertyListView({ properties }: { properties: Property[] }) {
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
                                <Link href={`/admin/properties/${property.id}`} className="font-bold hover:underline">
                                    {property.title}
                                </Link>
                            </CardTitle>
                            <CardDescription className="capitalize">
                                {property.modality} - ${Number(property.priceUSD).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end">
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
                                <TableCell>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/properties?edit=${property.id}`}>Ver Detalles</Link>
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
}

export function ContactDetailsClientView({ contactId, onClose }: ContactDetailsClientViewProps) {
  const [contact, setContact] = useState<Contact | undefined>(undefined);
  const [ownedProperties, setOwnedProperties] = useState<Property[]>([]);
  const [interestedProperties, setInterestedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchContactData = async () => {
      setLoading(true);
      const contactData = await getContactById(contactId);
      if (contactData) {
        setContact(contactData);
        let ownedProps: Property[] = [];
        let interestedProps: Property[] = [];
        
        if (contactData.types.includes('vendedor') || contactData.types.includes('arrendador')) {
          // ownedProps = await getPropertiesByOwnerId(contactData.id);
        }
        if ((contactData.types.includes('comprador') || contactData.types.includes('arrendatario')) && contactData.interestedPropertyIds && contactData.interestedPropertyIds.length > 0) {
          interestedProps = await getPropertiesByIds(contactData.interestedPropertyIds);
        }
        
        setOwnedProperties(ownedProps);
        setInterestedProperties(interestedProps);
      }
      setLoading(false);
    };

    fetchContactData();
  }, [contactId]);
  

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
    <div className='space-y-8'>
        <div className="mb-6">
            <BackButton />
        </div>

        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline text-2xl flex items-center gap-3">
                           <User /> {getFullName(contact)}
                        </CardTitle>
                        <CardDescription>Detalles del contacto y actividad.</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                       <Calendar size={16} /><span>Contactado el: {contact.date ? new Date(contact.date as any).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3"><Mail className="text-muted-foreground" size={20} /><a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a></div>
                        {contact.phone && (<div className="flex items-center gap-3"><Phone className="text-muted-foreground" size={20} /><span>{contact.phone}</span></div>)}
                         <div className="flex items-start gap-3"><Tag className="text-muted-foreground mt-1" size={20} /><div className="flex flex-wrap gap-2">{contact.types.map(type => (<Badge key={type} variant="secondary" className="capitalize text-sm">{type}</Badge>))}</div></div>
                    </div>
                </div>
                <div className="space-y-2 pt-6 border-t">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><FileText size={20}/> Notas</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-md">{contact.notes || 'No hay notas para este contacto.'}</p>
                </div>
            </CardContent>
        </Card>
        
        {ownedProperties.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><Home size={24}/> Propiedades en Posesión</h2>
                <PropertyListView properties={ownedProperties} />
            </div>
        )}

        {interestedProperties.length > 0 && (
            <div>
                 <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><Home size={24}/> Propiedades de Interés</h2>
                <PropertyListView properties={interestedProperties} />
            </div>
        )}
    </div>
  );
}
