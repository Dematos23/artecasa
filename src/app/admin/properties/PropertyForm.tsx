
"use client";

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Property } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { peruLocations } from '@/lib/peru-locations';


const propertySchema = z.object({
  title: z.string().min(1, { message: 'El título es obligatorio.' }),
  price: z.coerce.number().min(0, { message: 'El precio debe ser un número positivo.' }).optional(),
  currency: z.enum(['USD', 'PEN'], {
    required_error: 'Debes seleccionar una moneda.',
  }),
  modality: z.enum(['venta', 'alquiler'], {
    required_error: 'Debes seleccionar una modalidad.',
  }),
  region: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  garage: z.coerce.number().int().min(0).optional(),
  area_m2: z.coerce.number().int().min(0).optional(),
  antiquity: z.coerce.number().int().min(0, "Debe ser un número positivo").optional(),
  imageUrls: z.array(z.string()).optional().default([]),
  featured: z.boolean().default(false),
  newImages: z.any().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});


interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Omit<Property, 'id'>, newImages: File[]) => void;
  property?: Property;
  googleMapsApiKey: string | undefined;
}

const containerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: -12.046374,
  lng: -77.042793
};

function MapView({ address, location, onLocationChange }: { address: string, location?: {lat: number, lng: number}, onLocationChange: (location: {lat: number, lng: number}) => void }) {
    const [center, setCenter] = useState(location || defaultCenter);

    useEffect(() => {
      if (location) {
        setCenter(location);
      }
    }, [location]);

    const handleGeocode = useCallback(() => {
        if (address && window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const newLocation = results[0].geometry.location;
                    const newCenter = { lat: newLocation.lat(), lng: newLocation.lng() };
                    setCenter(newCenter);
                    onLocationChange(newCenter);
                } else {
                    console.error(`Geocode was not successful for the following reason: ${status}`);
                }
            });
        }
    }, [address, onLocationChange]);

    return (
        <div>
            <Button type="button" onClick={handleGeocode} className="mb-2" disabled={!address}>
                Buscar Dirección en el Mapa
            </Button>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
            >
                <Marker position={center} />
            </GoogleMap>
        </div>
    );
}

export function PropertyForm({ isOpen, onClose, onSave, property, googleMapsApiKey }: PropertyFormProps) {
  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
  });
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const watchedAddress = useWatch({ control: form.control, name: 'address' });
  const watchedRegion = useWatch({ control: form.control, name: 'region' });
  const watchedProvince = useWatch({ control: form.control, name: 'province' });
  const watchedDistrict = useWatch({ control: form.control, name: 'district' });
  const watchedLocation = useWatch({ control: form.control, name: 'location' });

  const provinces = useMemo(() => {
    return peruLocations.find(r => r.region === watchedRegion)?.provinces || [];
  }, [watchedRegion]);

  const districts = useMemo(() => {
    return provinces.find(p => p.province === watchedProvince)?.districts || [];
  }, [watchedProvince, provinces]);

  const fullAddress = useMemo(() => {
      return [watchedAddress, watchedDistrict, watchedProvince, watchedRegion, 'Perú'].filter(Boolean).join(', ');
  }, [watchedAddress, watchedDistrict, watchedProvince, watchedRegion]);


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || "",
    preventGoogleFontsLoading: true,
  });


  useEffect(() => {
    const defaultVals = property ? {
        ...property,
        price: Number(property.price?.replace(/,/g, '')),
    } : {
        title: '',
        price: 0,
        currency: 'USD' as const,
        modality: 'venta' as const,
        region: '',
        province: '',
        district: '',
        address: '',
        description: '',
        bedrooms: 0,
        bathrooms: 0,
        garage: 0,
        area_m2: 0,
        antiquity: 0,
        imageUrls: [],
        featured: false,
        newImages: [],
    };
    form.reset(defaultVals);
    setImagePreviews(property?.imageUrls || []);
  }, [property, form, isOpen]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
        const currentFiles = form.getValues('newImages') || [];
        form.setValue('newImages', [...currentFiles, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number, isNew: boolean) => {
    const currentPreviews = [...imagePreviews];
    if (isNew) {
        const newImageIndex = index - (property?.imageUrls?.length ?? 0);
        const newImages = [...(form.getValues('newImages') || [])];
        const removedPreview = imagePreviews[index];
        URL.revokeObjectURL(removedPreview);
        newImages.splice(newImageIndex, 1);
        form.setValue('newImages', newImages);
    } else {
        const imageUrls = [...(form.getValues('imageUrls') || [])];
        imageUrls.splice(index, 1);
        form.setValue('imageUrls', imageUrls);
    }
    
    currentPreviews.splice(index, 1);
    setImagePreviews(currentPreviews);
  };


  const onSubmit = async (values: z.infer<typeof propertySchema>) => {
    const { newImages, ...propertyData } = values;
    
    const finalProperty: Omit<Property, 'id'> = {
        ...propertyData,
        price: propertyData.price?.toString() ?? '0',
        imageUrls: values.imageUrls || [],
    }
    onSave(finalProperty, newImages || []);
  };

  const existingImageCount = property?.imageUrls?.length ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className='font-headline'>{property ? 'Editar Propiedad' : 'Agregar Nueva Propiedad'}</DialogTitle>
          <DialogDescription>
            {property ? 'Actualiza los detalles de la propiedad.' : 'Completa el formulario para agregar una nueva propiedad al listado.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. Villa Moderna..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-1">
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Ej. 2500000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Moneda</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una moneda" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                                    <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="modality"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modalidad</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una modalidad" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="venta">Venta</SelectItem>
                                    <SelectItem value="alquiler">Alquiler</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Describe la propiedad..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <FormField control={form.control} name="bedrooms" render={({ field }) => ( <FormItem><FormLabel>Dormitorios</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="bathrooms" render={({ field }) => ( <FormItem><FormLabel>Baños</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="garage" render={({ field }) => ( <FormItem><FormLabel>Cochera (autos)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="area_m2" render={({ field }) => ( <FormItem><FormLabel>Área (m²)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="antiquity" render={({ field }) => ( <FormItem><FormLabel>Antigüedad (años)</FormLabel><FormControl><Input type="number" placeholder="0 para 'A estrenar'" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 
                <div>
                  <FormLabel>Imágenes de la Propiedad</FormLabel>
                  <FormControl>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10">
                        <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-300" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-accent-foreground" >
                                    <span>Sube tus archivos</span>
                                    <input id="file-upload" name="newImages" type="file" className="sr-only" multiple onChange={handleImageChange} accept="image/*" />
                                </label>
                                <p className="pl-1">o arrástralos aquí</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF hasta 10MB</p>
                        </div>
                    </div>
                  </FormControl>
                   {imagePreviews.length > 0 && (
                     <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {imagePreviews.map((previewUrl, index) => (
                           <div key={index} className="relative group">
                             <Image src={previewUrl} alt={`Vista previa de imagen ${index + 1}`} width={150} height={150} className="h-24 w-24 object-cover rounded-md" />
                              <button type="button" onClick={() => removeImage(index, index >= existingImageCount)} className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" >
                                <X className="h-4 w-4" />
                               </button>
                           </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Región</FormLabel>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('province', '');
                                    form.setValue('district', '');
                                }} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar región..." /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {peruLocations.map(r => (<SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Provincia</FormLabel>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('district', '');
                                }} value={field.value} disabled={!watchedRegion}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar provincia..." /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {provinces.map(p => (<SelectItem key={p.province} value={p.province}>{p.province}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Distrito</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedProvince}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar distrito..." /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {districts.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. Av. Larco 123, Urb. San Antonio" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                {googleMapsApiKey ? (
                  isLoaded ? (
                    <div className="mt-2">
                        <MapView 
                            address={fullAddress} 
                            location={watchedLocation}
                            onLocationChange={(newLocation) => form.setValue('location', newLocation)}
                        />
                    </div>
                  ) : <div>Cargando mapa...</div>
                ) : <div className="text-sm text-muted-foreground">Para mostrar el mapa, por favor, añade tu clave de API de Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) a tus variables de entorno.</div>}
                
                 <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                ¿Propiedad Destacada?
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit">Guardar</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
