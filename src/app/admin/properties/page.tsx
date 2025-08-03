
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
import React, { useState, useEffect } from 'react';
import { PropertyForm } from './PropertyForm';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';


const storage = getStorage(app);


export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const searchParams = useSearchParams();
  const router = useRouter();
  const editPropertyId = searchParams.get('edit');

  useEffect(() => {
    // TODO: Fetch properties from Firestore
  }, []);

  useEffect(() => {
    if (editPropertyId) {
      const propertyToEdit = properties.find(p => p.id === editPropertyId);
      if (propertyToEdit) {
        setSelectedProperty(propertyToEdit);
        setIsFormOpen(true);
        // Clean the URL
        router.replace('/admin/properties');
      }
    }
  }, [editPropertyId, properties, router]);


  const handleSave = async (propertyData: Omit<Property, 'id'>, newImages: File[]) => {
    setIsSaving(true);

    try {
        // TODO: Replace with actual Firestore save logic
        const uploadedImageUrls = await Promise.all(
            newImages.map(async (file) => {
                const storageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                return getDownloadURL(storageRef);
            })
        );

        const finalPropertyData: Omit<Property, 'id'> = {
            ...propertyData,
            imageUrls: [...(propertyData.imageUrls || []), ...uploadedImageUrls],
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
    // Here you would also delete images from Firebase Storage and the document from Firestore
    setProperties(properties.filter(p => p.id !== id));
  };


  return (
    <>
      <PropertyForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        property={selectedProperty}
        googleMapsApiKey={googleMapsApiKey}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-headline">Gestión de Propiedades</h1>
          <p className="text-muted-foreground">Agrega, edita o elimina propiedades de tu listado.</p>
        </div>
        <Button onClick={openFormForCreate} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar Propiedad
        </Button>
      </div>
      
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle className="text-base truncate">
                <Link href={`/admin/properties/${property.id}`} className="font-bold">
                  {property.title}
                </Link>
              </CardTitle>
              <CardDescription className="capitalize">{property.modality} - {property.currency === 'USD' ? '$' : 'S/'}{Number(property.price).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <Badge variant={property.featured ? 'default' : 'secondary'}>
                  {property.featured ? 'Destacada' : 'Estándar'}
                </Badge>
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
            </CardContent>
          </Card>
        ))}
      </div>
        
      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
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
                <TableCell>
                  <Link href={`/admin/properties/${property.id}`} className="font-bold">
                    {property.title}
                  </Link>
                </TableCell>
                <TableCell>{property.currency === 'USD' ? '$' : 'S/'}{Number(property.price).toLocaleString()}</TableCell>
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
      </div>
    </>
  );
}
