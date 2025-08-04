
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
import React, { useState, useEffect, useCallback } from 'react';
import { PropertyForm } from './PropertyForm';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';
import Image from 'next/image';
import { getProperties, addProperty, updateProperty, deleteProperty } from '@/services/properties';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PropertyDetailsClientView } from './PropertyDetailsClientView';

const storage = getStorage(app);


export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [viewingPropertyId, setViewingPropertyId] = useState<string | null>(null);

  const { toast } = useToast();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const propertiesData = await getProperties();
      setProperties(propertiesData);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las propiedades.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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
        
        const finalPropertyData = {
            ...propertyData,
            imageUrls: [...(propertyData.imageUrls || []), ...uploadedImageUrls],
        };

        if (selectedProperty) {
            await updateProperty(selectedProperty.id, finalPropertyData);
            toast({
                title: "Éxito",
                description: "La propiedad se ha actualizado correctamente.",
            });
        } else {
            await addProperty(finalPropertyData);
             toast({
                title: "Éxito",
                description: "La propiedad se ha creado correctamente.",
            });
        }

        await fetchProperties();
        setIsFormOpen(false);
        setSelectedProperty(undefined);
    } catch (error) {
        console.error("Error guardando propiedad: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo guardar la propiedad.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (propertyToDelete) {
        try {
            await deleteProperty(propertyToDelete.id, propertyToDelete.imageUrls);
            toast({
                title: "Éxito",
                description: "La propiedad se ha eliminado correctamente.",
            });
            await fetchProperties();
        } catch (error) {
            console.error("Error eliminando propiedad: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar la propiedad.",
            });
        } finally {
            setIsAlertOpen(false);
            setPropertyToDelete(null);
        }
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
  
  const handleViewDetails = (id: string) => {
    setViewingPropertyId(id);
  };

  const handleCloseDetails = () => {
    setViewingPropertyId(null);
  };

  const handleEditFromDetails = (property: Property) => {
    setViewingPropertyId(null);
    openFormForEdit(property);
  };

  if (viewingPropertyId) {
    return <PropertyDetailsClientView 
        propertyId={viewingPropertyId} 
        onClose={handleCloseDetails} 
        onEdit={handleEditFromDetails}
    />;
  }

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutely seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la propiedad y todas sus imágenes de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPropertyToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
      
      {loading ? (
        <p>Cargando propiedades...</p>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {properties.map((property) => {
              const price = property.modality === 'alquiler' ? property.pricePEN : property.priceUSD;
              const currencySymbol = property.modality === 'alquiler' ? 'S/' : '$';
              return (
                <Card key={property.id}>
                  {property.imageUrls?.[0] && (
                      <div className='cursor-pointer' onClick={() => handleViewDetails(property.id)}>
                          <Image
                              src={property.imageUrls[0]}
                              alt={property.title}
                              width={400}
                              height={200}
                              className="w-full h-48 object-cover rounded-t-lg"
                          />
                      </div>
                  )}
                  <CardHeader className={property.imageUrls?.[0] ? 'pt-4' : ''}>
                    <CardTitle className="text-base truncate">
                      <span className="font-bold cursor-pointer" onClick={() => handleViewDetails(property.id)}>
                        {property.title}
                      </span>
                    </CardTitle>
                    <CardDescription className="capitalize">{property.modality} - {currencySymbol}{Number(price).toLocaleString()}</CardDescription>
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
                           <DropdownMenuItem onClick={() => handleViewDetails(property.id)}>Ver Detalles</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openFormForEdit(property)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(property)} className="text-destructive">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </CardContent>
                </Card>
              )
            })}
          </div>
            
          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Imagen</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => {
                  const price = property.modality === 'alquiler' ? property.pricePEN : property.priceUSD;
                  const currencySymbol = property.modality === 'alquiler' ? 'S/' : '$';
                  return (
                    <TableRow key={property.id}>
                      <TableCell>
                          <div className='cursor-pointer' onClick={() => handleViewDetails(property.id)}>
                              {property.imageUrls?.[0] ? (
                                  <Image
                                      src={property.imageUrls[0]}
                                      alt={property.title}
                                      width={64}
                                      height={64}
                                      className="w-16 h-16 object-cover rounded-md"
                                  />
                              ) : (
                                  <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center text-muted-foreground">
                                      <PlusCircle className="w-6 h-6"/>
                                  </div>
                              )}
                          </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold cursor-pointer" onClick={() => handleViewDetails(property.id)}>
                          {property.title}
                        </span>
                      </TableCell>
                      <TableCell>{currencySymbol}{Number(price).toLocaleString()}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(property.id)}>Ver Detalles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openFormForEdit(property)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(property)} className="text-destructive">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  );
}
