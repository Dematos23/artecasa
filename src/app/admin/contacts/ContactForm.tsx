
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Contact, ContactType } from '@/types';
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
import React, { useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { UpdateContactData } from '@/services/contacts';

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
});

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: UpdateContactData) => Promise<void>;
  contact?: Contact;
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
};

export function ContactForm({ isOpen, onClose, onSave, contact }: ContactFormProps) {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const { formState: { errors } } = form;

  const watchedTypes = form.watch('types', contact?.types || []);

  useEffect(() => {
    if (isOpen) {
        form.reset(contact ? {
            ...contact,
            types: contact.types || [],
        } : defaultValues);
    }
  }, [contact, form, isOpen]);

  // --- Manejador para el envío del formulario ---
  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    onSave(values);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 pr-2 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4 pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstname">Primer Nombre <span className="text-primary">*</span></Label>
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
                        <Label htmlFor="firstlastname">Primer Apellido <span className="text-primary">*</span></Label>
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
                    <Label htmlFor="phone">Teléfono <span className="text-primary">*</span></Label>
                    <Input id="phone" type="tel" placeholder="Ej. 987654321" {...form.register('phone')} />
                    {errors.phone && <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea id="notes" placeholder="Escribe las notas del contacto..." {...form.register('notes')} />
                    {errors.notes && <p className="text-sm font-medium text-destructive">{errors.notes.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Tipo <span className="text-primary">*</span></Label>
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
            </div>
            
            <DialogFooter className='pt-4'>
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
