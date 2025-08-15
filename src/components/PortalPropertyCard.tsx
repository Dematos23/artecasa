
"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/types';
import { BedDouble, Bath, Building } from 'lucide-react';

interface PortalPropertyCardProps {
  property: Property;
}

export function PortalPropertyCard({ property }: PortalPropertyCardProps) {
  const getPreferredPrice = () => {
    switch (property.preferredCurrency) {
        case 'USD':
            return { price: property.priceUSD, currencySymbol: '$' };
        case 'PEN':
            return { price: property.pricePEN, currencySymbol: 'S/' };
        default:
            const price = property.modality === 'alquiler' ? property.pricePEN : property.priceUSD;
            const currencySymbol = property.modality === 'alquiler' ? 'S/' : '$';
            return { price, currencySymbol };
    }
  };

  const { price, currencySymbol } = getPreferredPrice();

  const imageUrl = property.imageUrls?.[0] ?? "https://placehold.co/400x300.png";
  
  const propertyUrl = `/properties/${property.tenantId}:${property.id}`;

  return (
    <Card className="overflow-hidden bg-casora-bg border-casora-border shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <Link href={propertyUrl}>
        <div className="relative">
          <Image
            src={imageUrl}
            data-ai-hint="house exterior"
            alt={property.title}
            width={400}
            height={300}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-4 left-4 capitalize bg-casora-highlight text-casora-text">{property.modality}</Badge>
          {property.featured && (
            <Badge className="absolute top-4 right-4 bg-casora-alert text-casora-on-dark">Destacada</Badge>
          )}
        </div>
        <CardContent className="p-4 text-casora-text">
          <h3 className="text-lg font-bold font-headline truncate group-hover:text-casora-accent transition-colors">
            {property.title}
          </h3>
          {property.address && <p className="text-sm text-casora-text-muted mt-1 truncate">{property.address}</p>}
          <div className="mt-4 flex justify-between items-center">
             <p className="text-xl font-bold text-casora-primary">{currencySymbol}{Number(price).toLocaleString()}{property.modality === 'alquiler' && <span className="text-sm font-normal text-casora-text-muted"> / mes</span>}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-casora-border flex justify-around text-sm text-casora-text-muted">
             {property.propertyType && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-casora-accent" />
                <span>{property.propertyType.split(' ')[0]}</span>
              </div>
            )}
            {property.bedrooms !== undefined && (
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-casora-accent" />
                <span>{property.bedrooms} Dorms</span>
              </div>
            )}
            {property.bathrooms !== undefined && (
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-casora-accent" />
                <span>{property.bathrooms} Baños</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
