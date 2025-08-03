
"use client";

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import type { Property } from '@/types';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import React, { useState } from 'react';
import { PropertyForm } from './PropertyForm';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase'; // Assuming you have firebase initialized here

const storage = getStorage(app);


const dummyProperties: Property[] = [
  { id: '1', title: 'Villa Moderna en Condominio Privado', price: '2,500,000', modality: 'venta', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, area_m2: 5800, imageUrls: [], featured: true },
  { id: '2', title: 'Penthouse en el Centro con Vistas a la Ciudad', price: '3,200,000', modality: 'venta', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, area_m2: 3500, imageUrls: [], featured: true },
  { id: '3', title: 'Acogedora Casa de Playa', price: '1,800,000', modality: 'alquiler', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, area_m2: 2200, imageUrls: [], featured: false },
];

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(dummyProperties);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (propertyData: Omit<Property, 'id'>, newImages: File[]) => {
    setIsSaving(true);

    try {
        const uploadedImageUrls = await Promise.all(
            newImages.map(async (file) => {
                const storageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                return getDownloadURL(storageRef);
            })
        );

        const finalPropertyData: Omit<Property, 'id'> = {
            ...propertyData,
            imageUrls: [...propertyData.imageUrls, ...uploadedImageUrls],
        };

        if (selectedProperty) {
            // Edit
            const updatedProperty = { ...finalPropertyData, id: selectedProperty.id };
            setProperties(properties.map(p => p.id === selectedProperty.id ? updatedProperty : p));
        } else {
            // Create
            const newProperty = { ...finalPropertyData, id: Date.now().toString() };
            setProperties([...properties, newProperty]);
        }

        setIsFormOpen(false);
        setSelectedProperty(undefined);
    } catch (error) {
        console.error("Error saving property or uploading images: ", error);
        // You would typically show a toast notification here
    } finally {
        setIsSaving(false);
    }
  };


  const openFormForEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsFormOpen(true);
  };
  
  const openFormForCreate = () => {
    setSelectedProperty(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    // Here you would also delete images from Firebase Storage
    setProperties(properties.filter(p => p.id !== id));
  };


  return (
    <>
      <PropertyForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        property={selectedProperty}
      />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline">Gestión de Propiedades</CardTitle>
              <CardDescription>Agrega, edita o elimina propiedades de tu listado.</CardDescription>
            </div>
            <Button onClick={openFormForCreate}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Propiedad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>${Number(property.price).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{property.modality}</TableCell>
                  <TableCell>
                    <Badge variant={property.featured ? 'default' : 'secondary'}>
                      {property.featured ? 'Destacada' : 'Estándar'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openFormForEdit(property)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(property.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
