
"use client";

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Contact, ContactType, Property } from '@/types';
import { contactTypes } from '@/types';

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
import React, { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Controller } from 'react-hook-form';

const contactSchema = z.object({
  firstname: z.string().min(1, { message: 'El primer nombre es obligatorio.' }),
  secondname: z.string().optional(),
  firstlastname: z.string().min(1, { message: 'El primer apellido es obligatorio.' }),
  secondlastname: z.string().optional(),
  email: z.string().email({ message: 'Debe ser un correo electrónico válido.' }),
  phone: z.string().optional(),
  notes: z.string().min(1, { message: 'Las notas son obligatorias.' }),
  types: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Debes seleccionar al menos un tipo.',
  }),
  interestedPropertyIds: z.array(z.string()).optional().default([]),
});

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Omit<Contact, 'id' | 'date'>) => void;
  contact?: Contact;
  properties: Property[];
}

const defaultValues = {
    firstname: '',
    secondname: '',
    firstlastname: '',
    secondlastname: '',
    email: '',
    phone: '',
    notes: '',
    types: [],
    interestedPropertyIds: [],
};

export function ContactForm({ isOpen, onClose, onSave, contact, properties }: ContactFormProps) {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
  });

  const watchedTypes = useWatch({ control: form.control, name: 'types', defaultValue: contact?.types || [] });
  const showInterestedProperties = watchedTypes.includes('comprador') || watchedTypes.includes('arrendatario');

  useEffect(() => {
    form.reset(contact || defaultValues);
  }, [contact, form, isOpen]);

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    onSave(values as Omit<Contact, 'id' | 'date'>);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className='font-headline'>{contact ? 'Editar Contacto' : 'Crear Nuevo Contacto'}</DialogTitle>
          <DialogDescription>
            {contact ? 'Actualiza los detalles del contacto.' : 'Completa el formulario para crear un nuevo contacto.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstname" render={({ field }) => ( 
                      <FormItem> 
                        <FormLabel>Primer Nombre</FormLabel> 
                        <FormControl><Input placeholder="Ej. Juan" {...field} /></FormControl> 
                        <FormMessage /> 
                      </FormItem> 
                    )}/>
                    <FormField control={form.control} name="secondname" render={({ field }) => ( <FormItem> <FormLabel>Segundo Nombre</FormLabel> <FormControl> <Input placeholder="Ej. Carlos" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstlastname" render={({ field }) => ( <FormItem> <FormLabel>Primer Apellido</FormLabel> <FormControl> <Input placeholder="Ej. Pérez" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="secondlastname" render={({ field }) => ( <FormItem> <FormLabel>Segundo Apellido</FormLabel> <FormControl> <Input placeholder="Ej. Gonzales" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Correo Electrónico</FormLabel> <FormControl> <Input type="email" placeholder="Ej. john@example.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Teléfono</FormLabel> <FormControl> <Input type="tel" placeholder="Ej. 987654321" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem> <FormLabel>Notas</FormLabel> <FormControl> <Textarea placeholder="Escribe las notas del contacto..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                
                <FormField
                  control={form.control}
                  name="types"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Tipo</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {contactTypes.map((item) => (
                           <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                               <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...field.value, item]
                                        : field.value?.filter((value) => value !== item);
                                      field.onChange(newValue);
                                    }}
                                  />
                               </FormControl>
                               <FormLabel className="font-normal capitalize">{item}</FormLabel>
                           </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                
                {showInterestedProperties && (
                  <FormField
                    control={form.control}
                    name="interestedPropertyIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Propiedades de Interés</FormLabel>
                         <FormControl>
                           <MultiSelect
                              options={properties.map(p => ({ value: p.id, label: p.title }))}
                              selected={field.value || []}
                              onChange={field.onChange}
                              className="w-full"
                              placeholder="Seleccionar propiedades..."
                            />
                         </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


// MultiSelect Component
interface MultiSelectProps {
    options: { label: string; value: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    className?: string;
    placeholder?: string;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, selected, onChange, className, placeholder="Seleccionar...", ...props }, ref) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const selectedLabels = options
        .filter(option => selected.includes(option.value))
        .map(option => option.label);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button ref={ref} variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between", className)} {...props}>
                    <span className="truncate">{selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}</span>
                    <Home className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar propiedad..." />
                    <CommandList>
                        <CommandEmpty>No se encontraron propiedades.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem key={option.value} onSelect={() => handleSelect(option.value)}>
                                    <Checkbox className="mr-2" checked={selected.includes(option.value)} onCheckedChange={() => handleSelect(option.value)} id={`multi-select-${option.value}`} />
                                    <label htmlFor={`multi-select-${option.value}`} className='cursor-pointer w-full'>{option.label}</label>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
});
MultiSelect.displayName = "MultiSelect";
