
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

export interface Settings {
  logoUrl?: string;
  defaultPropertyImageUrl?: string;
  heroImages?: string[];

  whatsappNumber: string;
  
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  whatsappUrl?: string;
  linkedinUrl?: string;
  telegramUrl?: string;

  showFacebook?: boolean;
  showInstagram?: boolean;
  showTiktok?: boolean;
  showX?: boolean;
  showWhatsapp?: boolean;
  showLinkedin?: boolean;
  showTelegram?: boolean;

  homepageTitle?: string;
  homepageSubtitle?: string;
  homepageHeroButtonText?: string;
  featuredPropertyTitle?: string;
  featuredPropertyButtonText?: string;
  discoverPropertiesTitle?: string;
  discoverPropertiesSubtitle?: string;
  discoverPropertiesButtonText?: string;
  contactTitle?: string;
  contactSubtitle?: string;
  contactAddressTitle?: string;
  contactAddressContent?: string;
  contactEmailTitle?: string;
  contactEmailContent?: string;
  contactPhoneTitle?: string;
  contactPhoneContent?: string;
  contactFormTitle?: string;
  contactFormSubtitle?: string;
  contactFormSubmitButtonText?: string;
  contactFormWhatsappButtonText?: string;
  thankYouTitle?: string;
  thankYouSubtitle?: string;
  thankYouButtonText?: string;

  // Theme settings
  primaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  bodyFont?: string;
  headlineFont?: string;

  updatedAt?: string | Timestamp | null;
}
