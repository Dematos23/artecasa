
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Property } from '@/types';
import { BedDouble, Bath, Car, Maximize, MapPin, Phone, CalendarClock } from 'lucide-react';
import Link from 'next/link';

// TODO: Replace with actual data fetching logic from Firestore
const getPropertyById = async (id: string): Promise<Property | undefined> => {
  return undefined;
};

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const { id: propertyId } = params;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!propertyId) return;
    const fetchProperty = async () => {
      setLoading(true);
      const fetchedProperty = await getPropertyById(propertyId);
      setProperty(fetchedProperty || null);
      setLoading(false);
    };
    fetchProperty();
  }, [propertyId]);

  if (loading) {
     return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold">Cargando propiedad...</h1>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold">Propiedad no encontrada</h1>
        <Button asChild className="mt-4">
          <Link href="/properties">Volver a Propiedades</Link>
        </Button>
      </div>
    );
  }
  
  const currencySymbol = property.currency === 'USD' ? '$' : 'S/';

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
              <Image
                src={property.imageUrls[0]}
                data-ai-hint="luxury property interior"
                alt={property.title}
                width={1200}
                height={800}
                className="w-full h-auto object-cover"
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Descripción de la Propiedad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-headline">Detalles de la Propiedad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-6">{currencySymbol}{Number(property.price).toLocaleString()} <span className="text-lg font-normal text-muted-foreground capitalize">{property.modality === 'alquiler' ? '/ mes' : `en ${property.modality}`}</span></p>
                <div className="space-y-4 text-foreground">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Dormitorios</span> <span className="font-semibold flex items-center gap-2">{property.bedrooms} <BedDouble size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Baños</span> <span className="font-semibold flex items-center gap-2">{property.bathrooms} <Bath size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Cochera</span> <span className="font-semibold flex items-center gap-2">{property.garage} <Car size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Área (m²)</span> <span className="font-semibold flex items-center gap-2">{property.area_m2.toLocaleString()} <Maximize size={18}/></span></div>
                  {property.antiquity !== undefined && (
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Antigüedad</span>
                        <span className="font-semibold flex items-center gap-2">
                            {property.antiquity === 0 ? 'A estrenar' : `${property.antiquity} años`}
                            <CalendarClock size={18}/>
                        </span>
                    </div>
                   )}
                </div>
                <Button asChild size="lg" className="w-full mt-8">
                  <Link href="/contact">
                    <Phone className="mr-2" />
                    Consultar sobre esta Propiedad
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
