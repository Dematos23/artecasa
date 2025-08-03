
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/types';
import { BedDouble, Bath, Car } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const currencySymbol = property.currency === 'USD' ? '$' : 'S/';

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <Link href={`/properties/${property.id}`}>
        <div className="relative">
          <Image
            src={property.imageUrls?.[0] ?? '/appartment.webp'}
            data-ai-hint="house exterior"
            alt={property.title}
            width={400}
            height={300}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-4 left-4 capitalize">{property.modality}</Badge>
          {property.featured && (
            <Badge className="absolute top-4 right-4">Destacada</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-bold font-headline truncate group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          {property.address && <p className="text-sm text-muted-foreground mt-1 truncate">{property.address}</p>}
          <div className="mt-4 flex justify-between items-center">
             <p className="text-xl font-bold text-primary">{currencySymbol}{Number(property.price).toLocaleString()}{property.modality === 'alquiler' && <span className="text-sm font-normal text-muted-foreground"> / mes</span>}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-around text-sm text-muted-foreground">
            {property.bedrooms !== undefined && (
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-primary" />
                <span>{property.bedrooms} Dorms</span>
              </div>
            )}
            {property.bathrooms !== undefined && (
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-primary" />
                <span>{property.bathrooms} Baños</span>
              </div>
            )}
             {property.garage !== undefined && (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                <span>{property.garage} Cochera</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
