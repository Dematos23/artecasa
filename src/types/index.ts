
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
  tenantId?: string; // Added to easily identify the owner tenant on portal queries
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
  preferredCurrency: 'USD' | 'PEN';
}

// Type for new property data, omitting id which will be generated
export type NewPropertyData = Omit<Property, 'id'>;
export type UpdatePropertyData = Partial<NewPropertyData>;


export const contactTypes = ['comprador', 'arrendatario', 'propietario'] as const;
export type ContactType = (typeof contactTypes)[number];

// This type remains for tenant-internal CRM data
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
  date?: Date | Timestamp | null | undefined;
  // Associations
  ownerOfPropertyIds?: string[];
  interestedInPropertyIds?: string[];
  tenantOfPropertyId?: string | null;
}

export const associationTypes = ['owner', 'interested', 'inquilino'] as const;
export type AssociationType = (typeof associationTypes)[number];


export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    date: Date | Timestamp;
}

// These settings now apply to a Tenant and are stored under /tenants/{tenantId}/settings/default
export interface Settings {
  logoUrl?: string;
  defaultPropertyImageUrl?: string;
  heroImages?: string[];

  whatsappNumber: string;
  claimsEmail?: string;
  
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
  whatsappUrl?: string;
  linkedinUrl?: string;
  telegramUrl?: string;

  showFacebook?: boolean;
  showInstagram?: boolean;
  showTiktok?: boolean;
  showX?: boolean;
  showYoutube?: boolean;
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

export const documentTypes = ['DNI', 'CE', 'Pasaporte'] as const;
export type DocumentType = (typeof documentTypes)[number];

export interface Claim {
    id: string;
    correlative: string;
    fullName: string;
    documentType: DocumentType;
    documentNumber: string;
    phone: string;
    email: string;
    address: string;
    productOrService: string;
    claimedAmount: number;
    description: string;
    clientRequest: string;
    createdAt: Timestamp;
}
