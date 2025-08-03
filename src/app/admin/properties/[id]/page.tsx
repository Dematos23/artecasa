
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Contact, Property } from '@/types';
import Link from 'next/link';
import { ArrowLeft, User, Users, Home, Building2, DollarSign, Tag, FileText, BedDouble, Bath, Car, Maximize, CalendarClock, MapPin } from 'lucide-react';
import Image from 'next/image';

const dummyProperties: Property[] = [
    { id: '1', title: 'Villa Moderna en Condominio Privado', price: '2,500,000', modality: 'venta', region: 'Lima', province: 'Lima', district: 'Miraflores', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, area_m2: 5800, imageUrls: ['https://placehold.co/1200x800.png'], featured: true, ownerId: '3', interestedContactIds: ['1'], description: 'Experimenta un lujo sin igual en esta impresionante villa moderna. Con un espacio de vida de concepto abierto, cocina de última generación y una impresionante piscina infinita. Ubicada en un exclusivo condominio privado, esta casa ofrece privacidad y prestigio.', antiquity: "5" },
    { id: '2', title: 'Penthouse en el Centro con Vistas a la Ciudad', price: '3,200,000', modality: 'venta', region: 'Lima', province: 'Lima', district: 'San Isidro', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, area_m2: 3500, imageUrls: ['https://placehold.co/1200x800.png'], featured: true, ownerId: '3', description: 'Un magnífico penthouse que ofrece vistas panorámicas del horizonte de la ciudad. Con ventanas de piso a techo, una terraza privada y acabados a medida, esta residencia es el epítome de la sofisticación urbana.', antiquity: "A estrenar" },
    { id: '3', title: 'Acogedora Casa de Playa', price: '1,800,000', modality: 'alquiler', region: 'Lima', province: 'Cañete', district: 'Asia', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, area_m2: 2200, imageUrls: ['https://placehold.co/1200x800.png'], featured: false, ownerId: '3', interestedContactIds: ['2'], description: 'Encantadora y elegante casa de playa con acceso directo a la arena. Disfruta de espectaculares vistas al mar desde todas las habitaciones, una espaciosa terraza para el entretenimiento y los tranquilos sonidos de las olas.', antiquity: "10" },
];

const dummyContacts: Contact[] = [
  { id: '1', firstname: 'John', firstlastname: 'Doe', email: 'john.doe@example.com', notes: 'Estoy interesado en la Villa Moderna.', date: '2024-05-20', types: ['comprador'], phone: '987654321' },
  { id: '2', firstname: 'Jane', firstlastname: 'Smith', email: 'jane.smith@example.com', notes: 'Por favor, programar una visita para la casa de playa.', date: '2024-05-19', types: ['arrendatario'], phone: '987654322' },
  { id: '3', firstname: 'Sam', firstlastname: 'Wilson', email: 'sam.wilson@example.com', notes: 'Soy el propietario de varias propiedades de lujo.', date: '2024-05-18', types: ['vendedor', 'arrendador'], phone: '987654323' },
];

const getPropertyById = (id: string): Property | undefined => {
  return dummyProperties.find(p => p.id === id);
};

const getContactById = (id: string): Contact | undefined => {
    return dummyContacts.find(c => c.id === id);
}

const getContactsByIds = (ids: string[]): Contact[] => {
    return dummyContacts.filter(c => ids.includes(c.id));
}

const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}


export default function AdminPropertyDetailsPage({ params }: { params: { id: string } }) {
  const property = getPropertyById(params.id);
  
  if (!property) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Propiedad no encontrada</h1>
        <Button asChild>
          <Link href="/admin/properties">
            <ArrowLeft className="mr-2" /> Volver a Propiedades
          </Link>
        </Button>
      </div>
    );
  }
  
  const owner = property.ownerId ? getContactById(property.ownerId) : undefined;
  const interestedContacts = property.interestedContactIds ? getContactsByIds(property.interestedContactIds) : [];

  return (
    <div>
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/properties"><ArrowLeft className="mr-2" /> Volver a Propiedades</Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                                   <Home /> {property.title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 pt-1"><MapPin size={14}/> {property.address}, {property.district}, {property.province}, {property.region}</CardDescription>
                            </div>
                            <Badge variant={property.featured ? 'default' : 'secondary'}>
                                {property.featured ? 'Destacada' : 'Estándar'}
                            </Badge>
                        </div>
                    </CardHeader>
                     <CardContent>
                        <div className="relative w-full h-96 rounded-lg overflow-hidden mb-6">
                            <Image src={property.imageUrls[0]} alt={property.title} fill style={{objectFit: 'cover'}} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center mb-6 py-4 border-y">
                            <div className="flex flex-col items-center gap-1"><BedDouble size={20} className="text-primary"/> <span className="font-semibold">{property.bedrooms}</span> <span className="text-xs text-muted-foreground">Dorms</span></div>
                            <div className="flex flex-col items-center gap-1"><Bath size={20} className="text-primary"/> <span className="font-semibold">{property.bathrooms}</span> <span className="text-xs text-muted-foreground">Baños</span></div>
                            <div className="flex flex-col items-center gap-1"><Car size={20} className="text-primary"/> <span className="font-semibold">{property.garage}</span> <span className="text-xs text-muted-foreground">Cochera</span></div>
                            <div className="flex flex-col items-center gap-1"><Maximize size={20} className="text-primary"/> <span className="font-semibold">{property.area_m2}</span> <span className="text-xs text-muted-foreground">m²</span></div>
                            <div className="flex flex-col items-center gap-1"><CalendarClock size={20} className="text-primary"/> <span className="font-semibold">{property.antiquity || 'N/A'}</span> <span className="text-xs text-muted-foreground">Antigüedad</span></div>
                        </div>

                         <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2 text-lg"><FileText size={20}/> Descripción</h4>
                            <p className="text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-md">{property.description || 'No hay descripción para esta propiedad.'}</p>
                        </div>

                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2"><DollarSign size={20} /> Información Financiera</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-primary">${Number(property.price).toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground capitalize mt-1">{property.modality === 'alquiler' ? '/ mes' : `en ${property.modality}`}</div>
                    </CardContent>
                </Card>
                
                {owner && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl flex items-center gap-2"><User size={20} /> Propietario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/admin/contacts/${owner.id}`} className="text-primary hover:underline font-semibold">{getFullName(owner)}</Link>
                            <p className="text-sm text-muted-foreground">{owner.email}</p>
                        </CardContent>
                    </Card>
                )}
                 {interestedContacts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl flex items-center gap-2"><Users size={20} /> Contactos Interesados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {interestedContacts.map(contact => (
                                    <li key={contact.id} className="text-sm">
                                        <Link href={`/admin/contacts/${contact.id}`} className="text-primary hover:underline font-medium">{getFullName(contact)}</Link>
                                         <p className="text-xs text-muted-foreground">{contact.email}</p>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    </div>
  );
}
