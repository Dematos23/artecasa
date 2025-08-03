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

export type ContactStatus = 'Nuevo' | 'Contactado' | 'Resuelto';

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: ContactStatus;
}
