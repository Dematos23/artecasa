
"use client";

import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useEffect } from 'react';

const propertySchema = z.object({
  title: z.string().min(1, { message: 'El título es obligatorio.' }),
  price: z.string().min(1, { message: 'El precio es obligatorio.' }),
  address: z.string().min(1, { message: 'La dirección es obligatoria.' }),
  description: z.string().optional(),
  bedrooms: z.coerce.number().int().min(0, { message: 'Debe ser un número positivo.' }),
  bathrooms: z.coerce.number().int().min(0, { message: 'Debe ser un número positivo.' }),
  garage: z.coerce.number().int().min(0, { message: 'Debe ser un número positivo.' }),
  sqft: z.coerce.number().int().min(0, { message: 'Debe ser un número positivo.' }),
  imageUrl: z.string().url({ message: 'Debe ser una URL válida.' }).min(1, { message: 'La URL de la imagen es obligatoria.' }),
  featured: z.boolean().default(false),
});


interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  property?: Property;
}

export function PropertyForm({ isOpen, onClose, onSave, property }: PropertyFormProps) {
  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: property || {
        title: '',
        price: '',
        address: '',
        description: '',
        bedrooms: 0,
        bathrooms: 0,
        garage: 0,
        sqft: 0,
        imageUrl: '',
        featured: false,
    },
  });

  useEffect(() => {
    form.reset(property || {
        title: '',
        price: '',
        address: '',
        description: '',
        bedrooms: 0,
        bathrooms: 0,
        garage: 0,
        sqft: 0,
        imageUrl: '',
        featured: false,
    });
  }, [property, form, isOpen]);


  const onSubmit = (values: z.infer<typeof propertySchema>) => {
    onSave({ ...property, ...values } as Property);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
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
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. 123 Luxury Lane..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Precio</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Ej. 2,500,000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Dormitorios</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Baños</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="garage"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cochera (autos)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="sqft"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Pies Cuadrados</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>URL de la Imagen</FormLabel>
                        <FormControl>
                            <Input placeholder="https://placehold.co/800x600.png" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
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
                    <Button type="submit">Guardar Cambios</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
