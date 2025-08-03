import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Property } from '@/types';
import { BedDouble, Bath, Car, Maximize, MapPin, Phone, CalendarClock } from 'lucide-react';
import Link from 'next/link';

// Dummy data fetching function. Replace with actual data fetching logic.
const getPropertyById = (id: string): Property | undefined => {
  const properties: Property[] = [
    { id: '1', title: 'Villa Moderna en Condominio Privado', price: '2,500,000', modality: 'venta', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, area_m2: 5800, imageUrls: ['https://placehold.co/1200x800.png'], description: 'Experimenta un lujo sin igual en esta impresionante villa moderna. Con un espacio de vida de concepto abierto, cocina de última generación y una impresionante piscina infinita. Ubicada en un exclusivo condominio privado, esta casa ofrece privacidad y prestigio.', antiquity: "5" },
    { id: '2', title: 'Penthouse en el Centro con Vistas a la Ciudad', price: '3,200,000', modality: 'venta', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, area_m2: 3500, imageUrls: ['https://placehold.co/1200x800.png'], description: 'Un magnífico penthouse que ofrece vistas panorámicas del horizonte de la ciudad. Con ventanas de piso a techo, una terraza privada y acabados a medida, esta residencia es el epítome de la sofisticación urbana.', antiquity: "A estrenar" },
    { id: '3', title: 'Acogedora Casa de Playa', price: '1,800,000', modality: 'alquiler', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, area_m2: 2200, imageUrls: ['https://placehold.co/1200x800.png'], description: 'Encantadora y elegante casa de playa con acceso directo a la arena. Disfruta de espectaculares vistas al mar desde todas las habitaciones, una espaciosa terraza para el entretenimiento y los tranquilos sonidos de las olas.', antiquity: "10" },
    { id: '4', title: 'Rancho Extenso con Terreno', price: '4,500,000', modality: 'venta', address: '101 Country Road, Aspen, CO', bedrooms: 6, bathrooms: 7, garage: 4, area_m2: 8000, imageUrls: ['https://placehold.co/1200x800.png'], description: 'Un majestuoso rancho ubicado en 50 acres de tierra prístina. Esta extensa propiedad cuenta con una gran casa principal, cuartos de huéspedes e instalaciones ecuestres, todo con impresionantes fondos de montaña.', antiquity: "15" },
    { id: '5', title: 'Histórica Casa de Piedra en la Ciudad', price: '2,100,000', modality: 'venta', address: '212 City Block, Boston, MA', bedrooms: 5, bathrooms: 4, garage: 0, area_m2: 3200, imageUrls: ['https://placehold.co/1200x800.png'], description: 'Una casa de piedra histórica bellamente conservada que combina el carácter atemporal con las comodidades modernas. Ubicada en una pintoresca calle arbolada en el corazón de la ciudad.', antiquity: "100" },
    { id: '6', title: 'Casa Minimalista en el Desierto', price: '1,950,000', modality: 'alquiler', address: '321 Cactus Trail, Scottsdale, AZ', bedrooms: 3, bathrooms: 3, garage: 2, area_m2: 2800, imageUrls: ['https://placehold.co/1200x800.png'], description: 'Una obra maestra de diseño minimalista, esta casa en el desierto se integra a la perfección con su entorno natural. Líneas limpias, materiales naturales y un énfasis en la vida interior-exterior crean un refugio sereno.', antiquity: "2" },
  ];
  return properties.find(p => p.id === id);
};

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const property = getPropertyById(params.id);

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
                <p className="text-3xl md:text-4xl font-bold text-primary mb-6">${Number(property.price).toLocaleString()} <span className="text-lg font-normal text-muted-foreground capitalize">{property.modality === 'alquiler' ? '/ mes' : `en ${property.modality}`}</span></p>
                <div className="space-y-4 text-foreground">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Dormitorios</span> <span className="font-semibold flex items-center gap-2">{property.bedrooms} <BedDouble size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Baños</span> <span className="font-semibold flex items-center gap-2">{property.bathrooms} <Bath size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Cochera</span> <span className="font-semibold flex items-center gap-2">{property.garage} <Car size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Área (m²)</span> <span className="font-semibold flex items-center gap-2">{property.area_m2.toLocaleString()} <Maximize size={18}/></span></div>
                  {property.antiquity && (
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Antigüedad</span> <span className="font-semibold flex items-center gap-2">{property.antiquity} {isNaN(Number(property.antiquity)) ? '' : 'años'} <CalendarClock size={18}/></span></div>
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
