import { PropertyCard } from '@/components/PropertyCard';
import type { Property } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';

const dummyProperties: Property[] = [
  { id: '1', title: 'Villa Moderna en Condominio Privado', price: '2,500,000', modality: 'venta', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, area_m2: 5800, imageUrls: ['https://placehold.co/400x300.png'], featured: true },
  { id: '2', title: 'Penthouse en el Centro con Vistas a la Ciudad', price: '3,200,000', modality: 'venta', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, area_m2: 3500, imageUrls: ['https://placehold.co/400x300.png'], featured: true },
  { id: '3', title: 'Acogedora Casa de Playa', price: '1,800,000', modality: 'alquiler', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, area_m2: 2200, imageUrls: ['https://placehold.co/400x300.png'], featured: true },
  { id: '4', title: 'Rancho Extenso con Terreno', price: '4,500,000', modality: 'venta', address: '101 Country Road, Aspen, CO', bedrooms: 6, bathrooms: 7, garage: 4, area_m2: 8000, imageUrls: ['https://placehold.co/400x300.png'] },
  { id: '5', title: 'Histórica Casa de Piedra en la Ciudad', price: '2,100,000', modality: 'venta', address: '212 City Block, Boston, MA', bedrooms: 5, bathrooms: 4, garage: 0, area_m2: 3200, imageUrls: ['https://placehold.co/400x300.png'] },
  { id: '6', title: 'Casa Minimalista en el Desierto', price: '1,950,000', modality: 'alquiler', address: '321 Cactus Trail, Scottsdale, AZ', bedrooms: 3, bathrooms: 3, garage: 2, area_m2: 2800, imageUrls: ['https://placehold.co/400x300.png'] },
];

export default function PropertiesPage() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {dummyProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
