import { PropertyCard } from '@/components/PropertyCard';
import type { Property } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const dummyProperties: Property[] = [
  { id: '1', title: 'Modern Villa in a Gated Community', price: '2,500,000', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, sqft: 5800, imageUrl: 'https://placehold.co/400x300.png', featured: true },
  { id: '2', title: 'Downtown Penthouse with City Views', price: '3,200,000', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, sqft: 3500, imageUrl: 'https://placehold.co/400x300.png', featured: true },
  { id: '3', title: 'Cozy Beachfront Cottage', price: '1,800,000', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, sqft: 2200, imageUrl: 'https://placehold.co/400x300.png', featured: true },
  { id: '4', title: 'Sprawling Ranch with Acreage', price: '4,500,000', address: '101 Country Road, Aspen, CO', bedrooms: 6, bathrooms: 7, garage: 4, sqft: 8000, imageUrl: 'https://placehold.co/400x300.png' },
  { id: '5', title: 'Historic Brownstone in the City', price: '2,100,000', address: '212 City Block, Boston, MA', bedrooms: 5, bathrooms: 4, garage: 0, sqft: 3200, imageUrl: 'https://placehold.co/400x300.png' },
  { id: '6', title: 'Minimalist Desert Home', price: '1,950,000', address: '321 Cactus Trail, Scottsdale, AZ', bedrooms: 3, bathrooms: 3, garage: 2, sqft: 2800, imageUrl: 'https://placehold.co/400x300.png' },
];

export default function PropertiesPage() {
  return (
    <div className="container mx-auto py-12 px-[3%] md:px-[5%] xl:px-[12%]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Our Properties</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our collection of exquisite properties and find your next home.
        </p>
      </div>

      <Card className="p-4 md:p-6 mb-8 bg-secondary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by location, keyword..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
              <SelectItem value="cottage">Cottage</SelectItem>
              <SelectItem value="ranch">Ranch</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m-2m">$1,000,000 - $2,000,000</SelectItem>
              <SelectItem value="2m-3m">$2,000,000 - $3,000,000</SelectItem>
              <SelectItem value="3m+">$3,000,000+</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full">Search</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dummyProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
