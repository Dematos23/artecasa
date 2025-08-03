
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Contact, Property } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, User, Tag, FileText, Home, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const dummyContacts: Contact[] = [
  { id: '1', firstname: 'John', firstlastname: 'Doe', email: 'john.doe@example.com', notes: 'Estoy interesado en la Villa Moderna. ¿Puedo obtener más detalles?', date: '2024-05-20', types: ['comprador'], phone: '987654321', interestedPropertyIds: ['1', '2'] },
  { id: '2', firstname: 'Jane', firstlastname: 'Smith', email: 'jane.smith@example.com', notes: 'Por favor, programar una visita para el Penthouse del centro.', date: '2024-05-19', types: ['arrendatario'], phone: '987654322', interestedPropertyIds: ['3'] },
  { id: '3', firstname: 'Sam', firstlastname: 'Wilson', email: 'sam.wilson@example.com', notes: '¿Cuáles son las opciones de financiamiento disponibles?', date: '2024-05-18', types: ['vendedor', 'arrendador'], phone: '987654323', interestedPropertyIds: [] },
];

const dummyProperties: Property[] = [
  { id: '1', title: 'Villa Moderna en Condominio Privado', price: '2,500,000', modality: 'venta', region: 'Lima', province: 'Lima', district: 'Miraflores', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, area_m2: 5800, imageUrls: [], featured: true, ownerId: '3' },
  { id: '2', title: 'Penthouse en el Centro con Vistas a la Ciudad', price: '3,200,000', modality: 'venta', region: 'Lima', province: 'Lima', district: 'San Isidro', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, area_m2: 3500, imageUrls: [], featured: true, ownerId: '3' },
  { id: '3', title: 'Acogedora Casa de Playa', price: '1,800,000', modality: 'alquiler', region: 'Lima', province: 'Cañete', district: 'Asia', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, area_m2: 2200, imageUrls: [], featured: false, ownerId: '3' },
];


const getContactById = (id: string): Contact | undefined => {
  return dummyContacts.find(c => c.id === id);
};

const getPropertiesByOwnerId = (id: string): Property[] => {
    return dummyProperties.filter(p => p.ownerId === id);
}

const getPropertiesByIds = (ids: string[]): Property[] => {
    return dummyProperties.filter(p => ids.includes(p.id));
}

const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}


export default function ContactDetailsPage({ params }: { params: { id: string } }) {
  const contactId = params.id;
  const [contact] = useState(() => getContactById(contactId));
  
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

  const ownedProperties = (contact.types.includes('vendedor') || contact.types.includes('arrendador'))
    ? getPropertiesByOwnerId(contact.id)
    : [];
  
  const interestedProperties = (contact.types.includes('comprador') || contact.types.includes('arrendatario')) && contact.interestedPropertyIds
    ? getPropertiesByIds(contact.interestedPropertyIds)
    : [];

  return (
    <div className='space-y-8'>
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/contacts"><ArrowLeft className="mr-2" /> Volver a Contactos</Link>
            </Button>
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
                       <Calendar size={16} /><span>Contactado el: {new Date(contact.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

function PropertyListView({ properties }: { properties: Property[] }) {
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
                                {property.modality} - ${Number(property.price).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end">
                             <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/properties/${property.id}`}>Ver Detalles</Link>
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
                            <TableHead>Precio</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {properties.map((property) => (
                            <TableRow key={property.id}>
                                <TableCell>
                                    <Link href={`/admin/properties/${property.id}`} className="font-bold hover:underline">
                                        {property.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">{property.address}</p>
                                </TableCell>
                                <TableCell className="capitalize">{property.modality}</TableCell>
                                <TableCell>${Number(property.price).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/properties/${property.id}`}>Ver Detalles</Link>
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

    

    