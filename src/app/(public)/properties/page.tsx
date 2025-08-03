
"use client";

import { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import type { Property } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  
  useEffect(() => {
    // TODO: Fetch properties from Firestore
  }, []);

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold font-headline mb-4">Nuestras Propiedades</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Explora nuestra colección de propiedades exclusivas y encuentra tu próximo hogar.
        </p>
      </div>

      <Card className="p-4 md:p-6 mb-8 bg-secondary">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Input
              type="text"
              placeholder="Buscar por ubicación, palabra clave..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Propiedad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
              <SelectItem value="cottage">Casa de campo</SelectItem>
              <SelectItem value="ranch">Rancho</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Rango de Precios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m-2m">$1,000,000 - $2,000,000</SelectItem>
              <SelectItem value="2m-3m">$2,000,000 - $3,000,000</SelectItem>
              <SelectItem value="3m+">$3,000,000+</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full">Buscar</Button>
        </div>
      </Card>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
         <div className="text-center py-16">
            <p className="text-muted-foreground">No se encontraron propiedades. Intenta ajustar tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
