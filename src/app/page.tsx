
import { Button } from '@/components/ui/button';
import { PortalPropertyCard } from '@/components/PortalPropertyCard';
import type { Property } from '@/types';
import Link from 'next/link';
import { ArrowRight, BedDouble, Bath, Car, MapPin, Search } from 'lucide-react';
import Image from 'next/image';
import { listPublicPropertiesPortal } from '@/actions/portal';
import { getSettings } from '@/services/settings';
import { PortalHeader } from '@/components/layout/PortalHeader';
import { Input } from '@/components/ui/input';

async function getPortalData() {
    const { properties } = await listPublicPropertiesPortal({ pageSize: 6 });
    const settings = await getSettings(null); // Settings for the portal itself
    return { properties, settings };
}

function SearchBar() {
  return (
    <div className="mt-8 max-w-2xl w-full mx-auto">
      <form action="/properties" method="GET" className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl flex items-center gap-2">
        <Search className="h-5 w-5 text-casora-text-muted ml-4" />
        <Input 
          type="text" 
          name="location"
          placeholder="Buscar por ciudad, distrito o vecindario..."
          className="flex-grow bg-transparent border-none text-base text-casora-text focus:ring-0"
        />
        <Button type="submit" size="lg" className="rounded-full bg-casora-accent hover:bg-casora-accent-hover text-casora-on-dark">
          Buscar
        </Button>
      </form>
    </div>
  )
}

export default async function PortalHomePage() {
  const { properties } = await getPortalData();

  return (
    <>
    <PortalHeader />
    <main>
      <section className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full flex items-center justify-center text-center text-white">
        <Image
          src="https://placehold.co/1920x1080.png"
          data-ai-hint="beautiful modern house"
          alt="Una hermosa casa moderna en un día soleado"
          fill
          style={{ objectFit: 'cover' }}
          className="w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 md:px-6">
           <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline mb-4">La Propiedad de Tus Sueños, a un Clic.</h1>
           <p className="text-lg sm:text-xl md:text-2xl max-w-3xl">Explora el catálogo más exclusivo de propiedades en venta y alquiler.</p>
           <SearchBar />
        </div>
      </section>
      
      <section className="py-12 md:py-24 bg-casora-bg-soft">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 text-casora-text">Propiedades Recientes</h2>
            <p className="text-base md:text-lg text-casora-text-muted max-w-2xl mx-auto">
              Una cuidada selección de las mejores propiedades de lujo, adaptadas a tu estilo de vida.
            </p>
          </div>
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {properties.map((property) => (
                <PortalPropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
                <p className="text-casora-text-muted">Actualmente no hay propiedades para mostrar. Vuelve a consultar pronto.</p>
            </div>
          )}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-casora-secondary text-casora-text hover:bg-casora-secondary-hover">
              <Link href="/properties">
                Ver Todas las Propiedades
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
