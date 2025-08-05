
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
import { PlusCircle, MoreHorizontal, Search, ChevronsUpDown } from 'lucide-react';
import type { Property, Contact } from '@/types';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PropertyForm } from './PropertyForm';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';
import Image from 'next/image';
import { getProperties, addProperty, updateProperty, deleteProperty } from '@/services/properties';
import { getContacts } from '@/services/contacts';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


const storage = getStorage(app);

const getOwnerName = (ownerId: string | undefined, contacts: Contact[]) => {
  if (!ownerId) return 'N/A';
  const owner = contacts.find(c => c.id === ownerId);
  return owner ? `${owner.firstname} ${owner.firstlastname}` : 'Desconocido';
}


export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [viewingPropertyId, setViewingPropertyId] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('USD');


  const { toast } = useToast();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [propertiesData, contactsData] = await Promise.all([
        getProperties(),
        getContacts(),
      ]);
      setProperties(propertiesData);
      setContacts(contactsData);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
       const lowercasedQuery = searchQuery.toLowerCase();
       const ownerName = getOwnerName(property.ownerId, contacts).toLowerCase();
       
       const searchMatch = !searchQuery || 
         property.title.toLowerCase().includes(lowercasedQuery) ||
         ownerName.includes(lowercasedQuery);

       const modalityMatch = modalityFilter === 'all' || property.modality === modalityFilter;

       const minPriceNumber = minPrice ? Number(minPrice) : 0;
       const maxPriceNumber = maxPrice ? Number(maxPrice) : Infinity;
       const priceToCompare = priceCurrency === 'PEN' ? property.pricePEN : property.priceUSD;
       const priceMatch = priceToCompare >= minPriceNumber && priceToCompare <= maxPriceNumber;

       return searchMatch && modalityMatch && priceMatch;
    });
  }, [properties, contacts, searchQuery, modalityFilter, minPrice, maxPrice, priceCurrency]);


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

        await fetchData();
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
            await fetchData();
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
    setViewingPropertyId(null);
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
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setModalityFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setPriceCurrency('USD');
  }

  const priceButtonText = useMemo(() => {
    const symbol = priceCurrency === 'PEN' ? 'S/' : '$';
    if (minPrice && maxPrice) return `${symbol}${Number(minPrice).toLocaleString()} - ${symbol}${Number(maxPrice).toLocaleString()}`;
    if (minPrice) return `Desde ${symbol}${Number(minPrice).toLocaleString()}`;
    if (maxPrice) return `Hasta ${symbol}${Number(maxPrice).toLocaleString()}`;
    return 'Rango de Precio';
  }, [minPrice, maxPrice, priceCurrency]);


  return (
    <>
      {viewingPropertyId && (
        <PropertyDetailsClientView
          propertyId={viewingPropertyId}
          onClose={handleCloseDetails}
          onEdit={handleEditFromDetails}
        />
      )}
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

       <Card className="p-4 md:p-6 mb-8">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2">
              <Label>Buscar Propiedad</Label>
               <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por título o propietario..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                />
              </div>
          </div>

          <div>
            <Label>Modalidad</Label>
            <Select value={modalityFilter} onValueChange={setModalityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Operación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="alquiler">Alquiler</SelectItem>
              </SelectContent>
            </Select>
          </div>

           <div>
            <Label>Rango de Precio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  <span className='truncate'>{priceButtonText}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-price">Precio Mín.</Label>
                      <Input id="min-price" placeholder="Mínimo" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" />
                    </div>
                    <div>
                      <Label htmlFor="max-price">Precio Máx.</Label>
                      <Input id="max-price" placeholder="Máximo" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" />
                    </div>
                  </div>
                   <div className="space-y-2">
                        <Label>Moneda</Label>
                        <Select value={priceCurrency} onValueChange={setPriceCurrency}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">Dólares (USD)</SelectItem>
                                <SelectItem value="PEN">Soles (PEN)</SelectItem>
                            </SelectContent>
                        </Select>
                   </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

         </div>
         <div className="mt-4 flex justify-end">
            <Button onClick={handleClearFilters} variant="secondary" size="sm">Limpiar Filtros</Button>
        </div>
      </Card>
      
      {loading ? (
        <p>Cargando propiedades...</p>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {filteredProperties.map((property) => {
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
                  <TableHead>Propietario</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => {
                  const getPreferredPrice = () => {
                    switch (property.preferredCurrency) {
                        case 'USD':
                            return { price: property.priceUSD, currencySymbol: '$' };
                        case 'PEN':
                            return { price: property.pricePEN, currencySymbol: 'S/' };
                        default:
                            const price = property.modality === 'alquiler' ? property.pricePEN : property.priceUSD;
                            const currencySymbol = property.modality === 'alquiler' ? 'S/' : '$';
                            return { price, currencySymbol };
                    }
                  };
                  const { price, currencySymbol } = getPreferredPrice();
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
                      <TableCell>{getOwnerName(property.ownerId, contacts)}</TableCell>
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
           {filteredProperties.length === 0 && !loading && (
              <div className="text-center py-16">
                  <p className="text-muted-foreground">
                      No se encontraron propiedades que coincidan con tus filtros.
                  </p>
              </div>
            )}
        </>
      )}
    </>
  );
}


    