
"use client"
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/PropertyCard';
import type { Property, Settings } from '@/types';
import Link from 'next/link';
import { ArrowRight, BedDouble, Bath, Car, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import React, { useState, useEffect } from 'react';
import { getProperties } from '@/services/properties';
import { getSettings } from '@/services/settings';
import { Skeleton } from '@/components/ui/skeleton';


export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const [propertiesData, settingsData] = await Promise.all([
          getProperties(),
          getSettings(),
        ]);
        setProperties(propertiesData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Error fetching page data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const featuredProperty = properties.find(p => p.featured);
  const recentProperties = properties.filter(p => !p.featured).slice(0, 3);
  const heroImages = settings?.heroImages || [];


  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <div className="bg-background">
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] w-full flex items-center justify-center">
        {heroImages.length === 0 ? (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <p className="text-muted-foreground">No hay imágenes en el carrusel.</p>
          </div>
        ) : (
          <Carousel
            plugins={[plugin.current]}
            className="absolute w-full h-full"
            opts={{ loop: true }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="h-full">
              {heroImages.map((src, index) => (
                <CarouselItem key={index} className="relative h-full">
                  <Image
                    src={src}
                    alt={`Imagen de fondo de una casa de lujo moderna ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="w-full h-full"
                    priority={index === 0}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4 md:px-6">
           <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline text-primary mb-4">{settings?.homepageTitle || 'Artecasa'}</h1>
           <p className="text-lg sm:text-xl md:text-2xl max-w-3xl">{settings?.homepageSubtitle || 'Donde la Casa de Tus Sueños se Hace Realidad'}</p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/properties">
              {settings?.homepageHeroButtonText || 'Explorar Propiedades'} <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {featuredProperty && (
        <section className="py-12 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2 relative rounded-lg overflow-hidden shadow-2xl">
                <Image 
                  src={featuredProperty.imageUrls[0] ?? '/appartment.webp'}
                  data-ai-hint="modern living room"
                  alt={featuredProperty.title} 
                  width={800} 
                  height={600} 
                  className="w-full h-auto" />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-2xl md:text-4xl font-bold font-headline mb-4">{settings?.featuredPropertyTitle || 'Propiedad Destacada'}</h2>
                <h3 className="text-xl md:text-2xl font-semibold text-primary mb-2">{featuredProperty.title}</h3>
                <p className="text-muted-foreground flex items-center gap-2 mb-4">
                  <MapPin size={16} /> {featuredProperty.address}
                </p>
                <p className="text-2xl md:text-3xl font-bold mb-6">
                  {featuredProperty.modality === 'alquiler'
                    ? `S/${Number(featuredProperty.pricePEN).toLocaleString()}`
                    : `$${Number(featuredProperty.priceUSD).toLocaleString()}`}
                  {featuredProperty.modality === 'alquiler' && ' / mes'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-foreground">
                  <div className="flex items-center gap-2"><BedDouble className="text-primary" /> <span>{featuredProperty.bedrooms} Dorms</span></div>
                  <div className="flex items-center gap-2"><Bath className="text-primary" /> <span>{featuredProperty.bathrooms} Baños</span></div>
                  <div className="flex items-center gap-2"><Car className="text-primary" /> <span>{featuredProperty.garage} Cochera</span></div>
                </div>
                <Button asChild>
                  <Link href={`/properties/${featuredProperty.id}`}>
                    {settings?.featuredPropertyButtonText || 'Ver Detalles'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">{settings?.discoverPropertiesTitle || 'Descubre Nuestras Propiedades'}</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {settings?.discoverPropertiesSubtitle || 'Una cuidada selección de las mejores casas de lujo, adaptadas a tu estilo de vida.'}
            </p>
          </div>
          {recentProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {recentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
                <p className="text-muted-foreground">Actualmente no hay propiedades para mostrar. Vuelve a consultar pronto.</p>
            </div>
          )}
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/properties">
                {settings?.discoverPropertiesButtonText || 'Ver Todas las Propiedades'}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
