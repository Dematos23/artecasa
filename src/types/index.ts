export interface Property {
  id: string;
  title: string;
  price: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  area_m2: number;
  imageUrls: string[];
  description?: string;
  featured?: boolean;
}
