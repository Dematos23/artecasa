
"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property, Settings } from '@/types';
import { BedDouble, Bath, Car, Building } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSettings } from '@/services/settings';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    async function fetchSettingsData() {
        const settingsData = await getSettings();
        setSettings(settingsData);
    }
    fetchSettingsData();
  }, []);
  
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

  const imageUrl = property.imageUrls?.[0] ?? settings?.defaultPropertyImageUrl ?? '/appartment.webp';

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <Link href={`/properties/${property.id}`}>
        <div className="relative">
          <Image
            src={imageUrl}
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
             <p className="text-xl font-bold text-primary">{currencySymbol}{Number(price).toLocaleString()}{property.modality === 'alquiler' && <span className="text-sm font-normal text-muted-foreground"> / mes</span>}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-around text-sm text-muted-foreground">
             {property.propertyType && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <span>{property.propertyType.split(' ')[0]}</span>
              </div>
            )}
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
