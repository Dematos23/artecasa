
import { Timestamp } from "firebase/firestore";

export interface Property {
  id: string;
  title: string;
  price: string;
  currency: 'USD' | 'PEN';
  modality: 'venta' | 'alquiler';
  region: string;
  province: string;
  district: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  area_m2: number;
  imageUrls: string[];
  description?: string;
  featured?: boolean;
  antiquity?: number;
}

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
