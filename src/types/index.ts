export interface Property {
  id: string;
  title: string;
  price: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  sqft: number;
  imageUrl: string;
  description?: string;
  featured?: boolean;
}
