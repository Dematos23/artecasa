
import { Timestamp } from "firebase/firestore";

export const propertyTypes = [
  'Departamento',
  'Casa',
  'Terreno / Lote',
  'Local comercial',
  'Oficina comercial',
  'Casa de campo',
  'Casa de playa'
] as const;
export type PropertyType = (typeof propertyTypes)[number];

export interface Property {
  id: string;
  title: string;
  priceUSD: number;
  pricePEN: number;
  modality: 'venta' | 'alquiler';
  propertyType?: PropertyType;
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
  ownerId?: string;
  preferredCurrency?: 'USD' | 'PEN';
}

// Type for new property data, omitting id which will be generated
export type NewPropertyData = Omit<Property, 'id'>;
export type UpdatePropertyData = Partial<NewPropertyData>;


export const contactTypes = ['comprador', 'arrendatario', 'propietario'] as const;
export type ContactType = (typeof contactTypes)[number];

export const associationTypes = ['owner', 'interested', 'inquilino'] as const;
export type AssociationType = (typeof associationTypes)[number];

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
  interestedInPropertyIds?: string[];
  ownerOfPropertyIds?: string[];
  tenantOfPropertyId?: string;
  date?: Date | Timestamp | null | undefined;
}

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    date: Date | Timestamp;
}
