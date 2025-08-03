
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Contact, Property } from '@/types';
import Link from 'next/link';
import { ArrowLeft, User, Users, Home, DollarSign, FileText, BedDouble, Bath, Car, Maximize, CalendarClock, MapPin, Edit } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// TODO: Replace with actual data fetching logic from Firestore
const getPropertyById = async (id: string): Promise<Property | undefined> => {
    return undefined;
};
const getContactById = async (id: string): Promise<Contact | undefined> => {
    return undefined;
}
const getContactsByIds = async (ids: string[]): Promise<Contact[]> => {
    return [];
}


const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}


export default function AdminPropertyDetailsPage({ params }: { params: { id: string } }) {
  const propertyId = params.id;
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Contact | undefined>(undefined);
  const [interestedContacts, setInterestedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const prop = await getPropertyById(propertyId);
      if (prop) {
        setProperty(prop);
        if (prop.ownerId) {
          const ownerContact = await getContactById(prop.ownerId);
          setOwner(ownerContact);
        }
        if (prop.interestedContactIds && prop.interestedContactIds.length > 0) {
          const interested = await getContactsByIds(prop.interestedContactIds);
          setInterestedContacts(interested);
        }
      }
      setLoading(false);
    };
    fetchDetails();
  }, [propertyId]);

  const handleEdit = () => {
    router.push(`/admin/properties?edit=${property?.id}`);
  }

  if (loading) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Cargando propiedad...</h1>
      </div>
    );
  }
  
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

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/properties"><ArrowLeft className="mr-2" /> Volver a Propiedades</Link>
            </Button>
            <Button size="sm" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Editar Propiedad
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
                        {property.imageUrls.length > 0 && (
                            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-6">
                                <Image src={property.imageUrls[0]} alt={property.title} fill style={{objectFit: 'cover'}} />
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center mb-6 py-4 border-y">
                            <div className="flex flex-col items-center gap-1"><BedDouble size={20} className="text-primary"/> <span className="font-semibold">{property.bedrooms}</span> <span className="text-xs text-muted-foreground">Dorms</span></div>
                            <div className="flex flex-col items-center gap-1"><Bath size={20} className="text-primary"/> <span className="font-semibold">{property.bathrooms}</span> <span className="text-xs text-muted-foreground">Baños</span></div>
                            <div className="flex flex-col items-center gap-1"><Car size={20} className="text-primary"/> <span className="font-semibold">{property.garage}</span> <span className="text-xs text-muted-foreground">Cochera</span></div>
                            <div className="flex flex-col items-center gap-1"><Maximize size={20} className="text-primary"/> <span className="font-semibold">{property.area_m2}</span> <span className="text-xs text-muted-foreground">m²</span></div>
                            <div className="flex flex-col items-center gap-1"><CalendarClock size={20} className="text-primary"/> <span className="font-semibold">{property.antiquity || 'N/A'}</span> <span className="text-xs text-muted-foreground">Antigüedad</span></div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                         </div>

                         <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2 text-lg"><FileText size={20}/> Descripción</h4>
                            <p className="text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-md">{property.description || 'No hay descripción para esta propiedad.'}</p>
                        </div>
                        
                         {interestedContacts.length > 0 && (
                            <div className="mt-8">
                                <h4 className="font-semibold flex items-center gap-2 text-lg mb-4"><Users size={20} /> Contactos Interesados</h4>
                                <ContactListView contacts={interestedContacts} />
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                 {/* This column is now empty, content was moved to the left side */}
            </div>
        </div>
    </div>
  );
}


function ContactListView({ contacts }: { contacts: Contact[] }) {
    return (
        <>
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {contacts.map((contact) => (
                    <Card key={contact.id}>
                        <CardHeader>
                             <CardTitle className="text-base">
                                <Link href={`/admin/contacts/${contact.id}`} className="font-bold hover:underline">
                                    {getFullName(contact)}
                                </Link>
                            </CardTitle>
                            <CardDescription>{contact.email}</CardDescription>
                        </CardHeader>
                         <CardContent>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id}>
                                <TableCell>
                                    <Link href={`/admin/contacts/${contact.id}`} className="font-bold hover:underline">
                                        {getFullName(contact)}
                                    </Link>
                                </TableCell>
                                <TableCell>{contact.email}</TableCell>
                                <TableCell>{contact.phone || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}
