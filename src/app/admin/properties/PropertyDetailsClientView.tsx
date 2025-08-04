
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Home, DollarSign, FileText, BedDouble, Bath, Car, Maximize, CalendarClock, MapPin, Edit } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPropertyById } from '@/services/properties';


export function PropertyDetailsClientView({ propertyId, onClose }: { propertyId: string, onClose?: () => void }) {
  const router = useRouter();

  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchDetails = async () => {
        setLoading(true);
        const prop = await getPropertyById(propertyId);
        setProperty(prop);
        setLoading(false);
      };
      fetchDetails();
  }, [propertyId]);

  const handleEdit = () => {
    // This will navigate to the properties page with a query param
    // The properties page will detect this and open the form for editing
    router.push(`/admin/properties?edit=${property?.id}`);
    // If we have an onClose handler, it means we are in the modal-like view
    // so we should call it to close the details view.
    if(onClose) {
      onClose();
    }
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
  
  const BackButton = () => (
    <Button asChild variant="outline" size="sm" onClick={onClose}>
        {onClose ? (
            <span className='flex items-center cursor-pointer'><ArrowLeft className="mr-2" /> Volver a Propiedades</span>
        ) : (
            <Link href="/admin/properties"><ArrowLeft className="mr-2" /> Volver a Propiedades</Link>
        )}
    </Button>
  );

  const antiquityText = property.antiquity === 0 ? 'A estrenar' : property.antiquity ? `${property.antiquity} años` : 'N/A';
  const fullAddress = [property.address, property.district, property.province, property.region].filter(Boolean).join(', ');

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <BackButton />
            <Button size="sm" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Editar Propiedad
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                                   <Home /> {property.title}
                                </CardTitle>
                                {fullAddress && <CardDescription className="flex items-center gap-2 pt-1"><MapPin size={14}/> {fullAddress}</CardDescription>}
                            </div>
                            <Badge variant={property.featured ? 'default' : 'secondary'}>
                                {property.featured ? 'Destacada' : 'Estándar'}
                            </Badge>
                        </div>
                    </CardHeader>
                     <CardContent>
                        {property.imageUrls && property.imageUrls.length > 0 ? (
                            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-6">
                                <Image src={property.imageUrls[0]} alt={property.title} fill style={{objectFit: 'cover'}} />
                            </div>
                        ) : (
                            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-6">
                                <Image src="/appartment.webp" alt="Default property image" fill style={{objectFit: 'cover'}} />
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center mb-6 py-4 border-y">
                            {property.bedrooms !== undefined && <div className="flex flex-col items-center gap-1"><BedDouble size={20} className="text-primary"/> <span className="font-semibold">{property.bedrooms}</span> <span className="text-xs text-muted-foreground">Dorms</span></div>}
                            {property.bathrooms !== undefined && <div className="flex flex-col items-center gap-1"><Bath size={20} className="text-primary"/> <span className="font-semibold">{property.bathrooms}</span> <span className="text-xs text-muted-foreground">Baños</span></div>}
                            {property.garage !== undefined && <div className="flex flex-col items-center gap-1"><Car size={20} className="text-primary"/> <span className="font-semibold">{property.garage}</span> <span className="text-xs text-muted-foreground">Cochera</span></div>}
                            {property.area_m2 !== undefined && <div className="flex flex-col items-center gap-1"><Maximize size={20} className="text-primary"/> <span className="font-semibold">{property.area_m2}</span> <span className="text-xs text-muted-foreground">m²</span></div>}
                            {property.antiquity !== undefined && <div className="flex flex-col items-center gap-1"><CalendarClock size={20} className="text-primary"/> <span className="font-semibold">{antiquityText}</span> <span className="text-xs text-muted-foreground">Antigüedad</span></div>}
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl flex items-center gap-2"><DollarSign size={20} /> Información Financiera</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-primary">${Number(property.priceUSD).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-2xl font-bold">S/{Number(property.pricePEN).toLocaleString()}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground capitalize mt-1">{property.modality === 'alquiler' ? 'por mes' : `en ${property.modality}`}</div>
                                </CardContent>
                            </Card>
                         </div>

                         <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2 text-lg"><FileText size={20}/> Descripción</h4>
                            <p className="text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-md">{property.description || 'No hay descripción para esta propiedad.'}</p>
                        </div>
                        
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
