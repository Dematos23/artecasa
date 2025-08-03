
export interface Property {
  id: string;
  title: string;
  price: string;
  modality: 'venta' | 'alquiler';
  address: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  area_m2: number;
  imageUrls: string[];
  description?: string;
  featured?: boolean;
  antiquity?: string;
}

export const contactTypes = ['comprador', 'arrendatario', 'arrendador', 'vendedor'] as const;
export type ContactType = (typeof contactTypes)[number];

export interface Contact {
  id: string;
  firstname: string;
  secondname?: string;
  firstlastname: string;
  secondlastname?: string;
  email: string;
  phone?: string;
  notes: string;
  date: string;
  types: ContactType[];
}
