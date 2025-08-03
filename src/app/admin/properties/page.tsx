
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

const dummyProperties: Property[] = [
  { id: '1', title: 'Villa Moderna en Condominio Privado', price: '2,500,000', address: '123 Luxury Lane, Beverly Hills, CA', bedrooms: 5, bathrooms: 6, garage: 3, sqft: 5800, imageUrl: '', featured: true },
  { id: '2', title: 'Penthouse en el Centro con Vistas a la Ciudad', price: '3,200,000', address: '456 High Rise, New York, NY', bedrooms: 3, bathrooms: 4, garage: 2, sqft: 3500, imageUrl: '', featured: true },
  { id: '3', title: 'Acogedora Casa de Playa', price: '1,800,000', address: '789 Ocean Drive, Malibu, CA', bedrooms: 4, bathrooms: 3, garage: 1, sqft: 2200, imageUrl: '', featured: false },
];

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(dummyProperties);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(undefined);

  const handleSave = (property: Property) => {
    if (selectedProperty) {
      // Edit
      setProperties(properties.map(p => p.id === property.id ? property : p));
    } else {
      // Create
      setProperties([...properties, { ...property, id: Date.now().toString() }]);
    }
    setIsFormOpen(false);
    setSelectedProperty(undefined);
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
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>${property.price}</TableCell>
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
