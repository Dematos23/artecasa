
"use client"
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/PropertyCard';
import type { Property } from '@/types';
import Link from 'next/link';
import { ArrowRight, BedDouble, Bath, Car, MapPin } from 'lucide-react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import React from 'react';

const heroImages = ['/hero1.webp', '/hero2.webp'];

const dummyProperties: Property[] = [
  {
    id: '1',
    title: 'Villa Moderna en Condominio Privado',
    price: '2,500,000',
    address: '123 Luxury Lane, Beverly Hills, CA',
    bedrooms: 5,
    bathrooms: 6,
    garage: 3,
    sqft: 5800,
    imageUrl: 'https://placehold.co/800x600.png',
    featured: true,
  },
  {
    id: '2',
    title: 'Penthouse en el Centro con Vistas a la Ciudad',
    price: '3,200,000',
    address: '456 High Rise, New York, NY',
    bedrooms: 3,
    bathrooms: 4,
    garage: 2,
    sqft: 3500,
    imageUrl: 'https://placehold.co/800x600.png',
    featured: true,
  },
  {
    id: '3',
    title: 'Acogedora Casa de Playa',
    price: '1,800,000',
    address: '789 Ocean Drive, Malibu, CA',
    bedrooms: 4,
    bathrooms: 3,
    garage: 1,
    sqft: 2200,
    imageUrl: 'https://placehold.co/800x600.png',
    featured: true,
  },
];


export default function Home() {
  const featuredProperty = dummyProperties[0];
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <div className="bg-background">
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] w-full">
        <Carousel 
          plugins={[plugin.current]}
          className="absolute w-full h-full" 
          opts={{ loop: true }}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          >
          <CarouselContent className="w-full h-full">
            {heroImages.map((src, index) => (
              <CarouselItem key={index} className="w-full h-full">
                <Image
                  src={src}
                  alt={`Imagen de fondo de una casa de lujo moderna ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="w-full h-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-[3%] md:px-[5%] xl:px-[12%]">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary mb-4">Artecasa</h1>
          <p className="text-xl md:text-2xl max-w-3xl">Donde la Casa de Tus Sueños se Hace Realidad</p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/properties">
              Explorar Propiedades <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-[3%] md:px-[5%] xl:px-[12%]">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2 relative rounded-lg overflow-hidden shadow-2xl">
              <Image 
                src={featuredProperty.imageUrl} 
                data-ai-hint="modern living room"
                alt={featuredProperty.title} 
                width={800} 
                height={600} 
                className="w-full h-auto" />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Propiedad Destacada</h2>
              <h3 className="text-2xl font-semibold text-primary mb-2">{featuredProperty.title}</h3>
              <p className="text-muted-foreground flex items-center gap-2 mb-4">
                <MapPin size={16} /> {featuredProperty.address}
              </p>
              <p className="text-3xl font-bold mb-6">${featuredProperty.price}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-foreground">
                <div className="flex items-center gap-2"><BedDouble className="text-primary" /> <span>{featuredProperty.bedrooms} Dorms</span></div>
                <div className="flex items-center gap-2"><Bath className="text-primary" /> <span>{featuredProperty.bathrooms} Baños</span></div>
                <div className="flex items-center gap-2"><Car className="text-primary" /> <span>{featuredProperty.garage} Cochera</span></div>
              </div>
              <Button asChild>
                <Link href={`/properties/${featuredProperty.id}`}>
                  Ver Detalles
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-[3%] md:px-[5%] xl:px-[12%]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Descubre Nuestras Propiedades</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una cuidada selección de las mejores casas de lujo, adaptadas a tu estilo de vida.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dummyProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/properties">
                Ver Todas las Propiedades
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

