
"use client"

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Property, Contact } from '@/types';
import { BedDouble, Bath, Car, Maximize, MapPin, Phone, CalendarClock, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const dummyProperties: Property[] = [
    { id: '1', title: 'Villa Moderna en Condominio Privado', price: '2,500,000', modality: 'venta', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, area_m2: 5800, imageUrls: ['https://placehold.co/1200x800.png'], description: 'Experimenta un lujo sin igual en esta impresionante villa moderna. Con un espacio de vida de concepto abierto, cocina de última generación y una impresionante piscina infinita. Ubicada en un exclusivo condominio privado, esta casa ofrece privacidad y prestigio.', antiquity: "5", ownerId: '3', interestedContactIds: ['1'] },
    { id: '2', title: 'Penthouse en el Centro con Vistas a la Ciudad', price: '3,200,000', modality: 'venta', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, area_m2: 3500, imageUrls: ['https://placehold.co/1200x800.png'], description: 'Un magnífico penthouse que ofrece vistas panorámicas del horizonte de la ciudad. Con ventanas de piso a techo, una terraza privada y acabados a medida, esta residencia es el epítome de la sofisticación urbana.', antiquity: "A estrenar", ownerId: '3', interestedContactIds: ['1'] },
    { id: '3', title: 'Acogedora Casa de Playa', price: '1,800,000', modality: 'alquiler', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, area_m2: 2200, imageUrls: ['https://placehold.co/1200x800.png'], description: 'Encantadora y elegante casa de playa con acceso directo a la arena. Disfruta de espectaculares vistas al mar desde todas las habitaciones, una espaciosa terraza para el entretenimiento y los tranquilos sonidos de las olas.', antiquity: "10", ownerId: '3', interestedContactIds: ['2'] },
];

const dummyContacts: Contact[] = [
  { id: '1', firstname: 'John', firstlastname: 'Doe', email: 'john.doe@example.com', notes: '', date: '', types: ['comprador'] },
  { id: '2', firstname: 'Jane', firstlastname: 'Smith', email: 'jane.smith@example.com', notes: '', date: '', types: ['arrendatario'] },
  { id: '3', firstname: 'Sam', firstlastname: 'Wilson', email: 'sam.wilson@example.com', notes: '', date: '', types: ['vendedor', 'arrendador'] },
];

const getPropertyById = (id: string): Property | undefined => {
  return dummyProperties.find(p => p.id === id);
};

const getContactById = (id: string): Contact | undefined => {
  return dummyContacts.find(c => c.id === id);
};

const getContactsByIds = (ids: string[]): Contact[] => {
    return dummyContacts.filter(c => ids.includes(c.id));
};

const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}


export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const [property] = useState(() => getPropertyById(params.id));

  if (!property) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold">Propiedad no encontrada</h1>
        <Button asChild className="mt-4"><Link href="/properties">Volver a Propiedades</Link></Button>
      </div>
    );
  }

  const owner = property.ownerId ? getContactById(property.ownerId) : undefined;
  const interestedContacts = property.interestedContactIds ? getContactsByIds(property.interestedContactIds) : [];

  return (
    <div className="bg-secondary">
      <div className="container mx-auto py-8 md:py-16 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-headline mb-2">{property.title}</h1>
          <p className="text-base md:text-lg text-muted-foreground flex items-center gap-2"><MapPin size={18} /> {property.address}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden mb-8">
              <Image src={property.imageUrls[0]} data-ai-hint="luxury property interior" alt={property.title} width={1200} height={800} className="w-full h-auto object-cover" />
            </Card>

            <div className='space-y-8'>
                <Card>
                  <CardHeader><CardTitle className="font-headline">Descripción de la Propiedad</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground">{property.description}</p></CardContent>
                </Card>

                {owner && (
                    <Card>
                        <CardHeader><CardTitle className="font-headline flex items-center gap-2"><User size={24}/> Propietario</CardTitle></CardHeader>
                        <CardContent>
                             <Link href={`/admin/contacts/${owner.id}`} className="text-primary hover:underline font-semibold">{getFullName(owner)}</Link>
                             <p className="text-sm text-muted-foreground">{owner.email}</p>
                        </CardContent>
                    </Card>
                )}

                {interestedContacts.length > 0 && (
                     <Card>
                        <CardHeader><CardTitle className="font-headline flex items-center gap-2"><User size={24}/> Contactos Interesados</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                {interestedContacts.map(contact => (
                                    <Link key={contact.id} href={`/admin/contacts/${contact.id}`} className="text-center">
                                        <Badge variant="secondary" className="text-sm py-1 px-3">{getFullName(contact)}</Badge>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-headline">Detalles de la Propiedad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-6">${Number(property.price).toLocaleString()} <span className="text-lg font-normal text-muted-foreground capitalize">{property.modality === 'alquiler' ? '/ mes' : `en ${property.modality}`}</span></p>
                <div className="space-y-4 text-foreground">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Dormitorios</span> <span className="font-semibold flex items-center gap-2">{property.bedrooms} <BedDouble size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Baños</span> <span className="font-semibold flex items-center gap-2">{property.bathrooms} <Bath size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Cochera</span> <span className="font-semibold flex items-center gap-2">{property.garage} <Car size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Área (m²)</span> <span className="font-semibold flex items-center gap-2">{property.area_m2.toLocaleString()} <Maximize size={18}/></span></div>
                  {property.antiquity && (<div className="flex justify-between items-center"><span className="text-muted-foreground">Antigüedad</span> <span className="font-semibold flex items-center gap-2">{property.antiquity} {isNaN(Number(property.antiquity)) ? '' : 'años'} <CalendarClock size={18}/></span></div>)}
                </div>
                <Button asChild size="lg" className="w-full mt-8">
                  <Link href="/contact"><Phone className="mr-2" />Consultar sobre esta Propiedad</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
