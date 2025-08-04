
import { Timestamp } from "firebase/firestore";

export interface Property {
  id: string;
  title: string;
  price: string;
  currency: 'USD' | 'PEN';
  exchangeRate: number;
  modality: 'venta' | 'alquiler';
  region?: string;
  province?: string;
  district?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  garage?: number;
  area_m2?: number;
  imageUrls: string[];
  description?: string;
  featured?: boolean;
  antiquity?: number;
  location?: {
    lat: number;
    lng: number;
  };
}

// Type for new property data, omitting id which will be generated
export type NewPropertyData = Omit<Property, 'id'>;
export type UpdatePropertyData = Partial<NewPropertyData>;


export const contactTypes = ['comprador', 'arrendatario', 'arrendador', 'vendedor'] as const;
export type ContactType = (typeof contactTypes)[number];

export interface Contact {
  id: string;
  firstname: string;
  secondname?: string;
  firstlastname: string;
  secondlastname?: string;
  email?: string;
  phone: string;
  notes?: string;
  types: ContactType[];
  interestedPropertyIds?: string[];
  date?: Date | Timestamp | null | undefined;
}
