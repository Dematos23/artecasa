
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

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const contactSchema = z.object({
  firstname: z.string().min(1, { message: 'El primer nombre es obligatorio.' }),
  secondname: z.string().optional(),
  firstlastname: z.string().min(1, { message: 'El primer apellido es obligatorio.' }),
  secondlastname: z.string().optional(),
  email: z.string().email({ message: 'Debe ser un correo electrónico válido.' }).optional().or(z.literal('')),
  phone: z.string().min(1, { message: 'El teléfono es obligatorio.' }),
  notes: z.string().optional(),
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

  const { formState: { errors } } = form;

  const watchedTypes = form.watch('types', contact?.types || []);
  const watchedInterestedProperties = form.watch('interestedPropertyIds', contact?.interestedPropertyIds || []);
  const showInterestedProperties = watchedTypes.includes('comprador') || watchedTypes.includes('arrendatario');

  useEffect(() => {
    form.reset(contact || defaultValues);
  }, [contact, form, isOpen]);

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    onSave(values as Omit<Contact, 'id' | 'date'>);
  };
  
  // --- Manejador manual para los checkboxes de 'types' ---
  const handleTypeChange = (item: ContactType, checked: boolean | 'indeterminate') => {
      const currentTypes = form.getValues('types') || [];
      const newTypes = checked 
          ? [...currentTypes, item]
          : currentTypes.filter(type => type !== item);
      form.setValue('types', newTypes, { shouldValidate: true });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className='font-headline'>{contact ? 'Editar Contacto' : 'Crear Nuevo Contacto'}</DialogTitle>
          <DialogDescription>
            {contact ? 'Actualiza los detalles del contacto.' : 'Completa el formulario para crear un nuevo contacto.'}
          </DialogDescription>
        </DialogHeader>
        {/* --- Formulario gestionado manualmente con react-hook-form --- */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
          {/* --- Campos de texto con form.register --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="firstname">Primer Nombre</Label>
                <Input id="firstname" placeholder="Ej. Juan" {...form.register('firstname')} />
                {errors.firstname && <p className="text-sm font-medium text-destructive">{errors.firstname.message}</p>}
             </div>
             <div className="space-y-2">
                <Label htmlFor="secondname">Segundo Nombre</Label>
                <Input id="secondname" placeholder="Ej. Carlos" {...form.register('secondname')} />
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="firstlastname">Primer Apellido</Label>
                <Input id="firstlastname" placeholder="Ej. Pérez" {...form.register('firstlastname')} />
                {errors.firstlastname && <p className="text-sm font-medium text-destructive">{errors.firstlastname.message}</p>}
             </div>
             <div className="space-y-2">
                <Label htmlFor="secondlastname">Segundo Apellido</Label>
                <Input id="secondlastname" placeholder="Ej. Gonzales" {...form.register('secondlastname')} />
             </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="Ej. john@example.com" {...form.register('email')} />
            {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" type="tel" placeholder="Ej. 987654321" {...form.register('phone')} />
            {errors.phone && <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" placeholder="Escribe las notas del contacto..." {...form.register('notes')} />
            {errors.notes && <p className="text-sm font-medium text-destructive">{errors.notes.message}</p>}
          </div>

          {/* --- Grupo de Checkboxes con manejo manual --- */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {contactTypes.map((item) => (
                 <div key={item} className="flex flex-row items-start space-x-3 space-y-0">
                   <Checkbox
                     id={`type-${item}`}
                     checked={watchedTypes.includes(item)}
                     onCheckedChange={(checked) => handleTypeChange(item, checked)}
                   />
                   <Label htmlFor={`type-${item}`} className="font-normal capitalize cursor-pointer">
                     {item}
                   </Label>
                 </div>
              ))}
            </div>
            {errors.types && <p className="text-sm font-medium text-destructive">{errors.types.message}</p>}
          </div>

          {/* --- Componente MultiSelect con manejo manual --- */}
          {showInterestedProperties && (
            <div className="space-y-2">
              <Label>Propiedades de Interés</Label>
              <MultiSelect
                options={properties.map(p => ({ value: p.id, label: p.title }))}
                selected={watchedInterestedProperties}
                onChange={(newSelection) => form.setValue('interestedPropertyIds', newSelection)}
                className="w-full"
                placeholder="Seleccionar propiedades..."
              />
              {errors.interestedPropertyIds && <p className="text-sm font-medium text-destructive">{errors.interestedPropertyIds.message}</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// MultiSelect Component (refactorizado para recibir props directamente)
interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, selected, onChange, className, placeholder = "Seleccionar...", ...props }, ref) => {
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
          <Button ref={ref} variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between", className)} {...props} onClick={() => setOpen(!open)}>
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

    
