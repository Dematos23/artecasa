import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Property } from '@/types';
import { BedDouble, Bath, Car, Maximize, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

// Dummy data fetching function. Replace with actual data fetching logic.
const getPropertyById = (id: string): Property | undefined => {
  const properties: Property[] = [
    { id: '1', title: 'Modern Villa in a Gated Community', price: '2,500,000', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, sqft: 5800, imageUrl: 'https://placehold.co/1200x800.png', description: 'Experience unparalleled luxury in this stunning modern villa. Featuring an open-concept living space, state-of-the-art kitchen, and a breathtaking infinity pool. Located in an exclusive gated community, this home offers both privacy and prestige.' },
    { id: '2', title: 'Downtown Penthouse with City Views', price: '3,200,000', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, sqft: 3500, imageUrl: 'https://placehold.co/1200x800.png', description: 'A magnificent penthouse offering panoramic views of the city skyline. With floor-to-ceiling windows, a private terrace, and bespoke finishes, this residence is the epitome of urban sophistication.' },
    { id: '3', title: 'Cozy Beachfront Cottage', price: '1,800,000', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, sqft: 2200, imageUrl: 'https://placehold.co/1200x800.png', description: 'Charming and elegant beachfront cottage with direct access to the sand. Enjoy spectacular ocean views from every room, a spacious deck for entertaining, and the tranquil sounds of the waves.' },
    { id: '4', title: 'Sprawling Ranch with Acreage', price: '4,500,000', address: '101 Country Road, Aspen, CO', bedrooms: 6, bathrooms: 7, garage: 4, sqft: 8000, imageUrl: 'https://placehold.co/1200x800.png', description: 'A majestic ranch set on 50 acres of pristine land. This expansive estate boasts a grand main house, guest quarters, and equestrian facilities, all with stunning mountain backdrops.' },
    { id: '5', title: 'Historic Brownstone in the City', price: '2,100,000', address: '212 City Block, Boston, MA', bedrooms: 5, bathrooms: 4, garage: 0, sqft: 3200, imageUrl: 'https://placehold.co/1200x800.png', description: 'A beautifully preserved historic brownstone that blends timeless character with modern amenities. Located on a picturesque, tree-lined street in the heart of the city.' },
    { id: '6', title: 'Minimalist Desert Home', price: '1,950,000', address: '321 Cactus Trail, Scottsdale, AZ', bedrooms: 3, bathrooms: 3, garage: 2, sqft: 2800, imageUrl: 'https://placehold.co/1200x800.png', description: 'A masterpiece of minimalist design, this desert home seamlessly integrates with its natural surroundings. Clean lines, natural materials, and an emphasis on indoor-outdoor living create a serene retreat.' },
  ];
  return properties.find(p => p.id === id);
};

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const property = getPropertyById(params.id);

  if (!property) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <Button asChild className="mt-4">
          <Link href="/properties">Back to Properties</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-secondary">
      <div className="container mx-auto py-12 md:py-16 px-[3%] md:px-[5%] xl:px-[12%]">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold font-headline mb-2">{property.title}</h1>
          <p className="text-lg text-muted-foreground flex items-center gap-2"><MapPin size={18} /> {property.address}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden mb-8">
              <Image
                src={property.imageUrl}
                data-ai-hint="luxury property interior"
                alt={property.title}
                width={1200}
                height={800}
                className="w-full h-auto object-cover"
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Property Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-headline">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary mb-6">${property.price}</p>
                <div className="space-y-4 text-foreground">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Bedrooms</span> <span className="font-semibold flex items-center gap-2">{property.bedrooms} <BedDouble size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Bathrooms</span> <span className="font-semibold flex items-center gap-2">{property.bathrooms} <Bath size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Garage</span> <span className="font-semibold flex items-center gap-2">{property.garage} <Car size={18}/></span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Sq. Ft.</span> <span className="font-semibold flex items-center gap-2">{property.sqft.toLocaleString()} <Maximize size={18}/></span></div>
                </div>
                <Button asChild size="lg" className="w-full mt-8">
                  <Link href="/contact">
                    <Phone className="mr-2" />
                    Inquire About This Property
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
