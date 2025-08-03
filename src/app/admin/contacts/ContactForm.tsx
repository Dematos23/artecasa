
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
import React, { useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

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
});

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Omit<Contact, 'id' | 'date'>) => void;
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
    defaultValues: contact || defaultValues,
  });

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
                    <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Primer Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Juan" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="secondname"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Segundo Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Carlos" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstlastname"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Primer Apellido</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Pérez" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="secondlastname"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Segundo Apellido</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Gonzales" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="Ej. john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                            <Input type="tel" placeholder="Ej. 987654321" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Escribe las notas del contacto..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="types"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Tipo</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {contactTypes.map((item) => (
                                <FormField
                                    key={item}
                                    control={form.control}
                                    name="types"
                                    render={({ field }) => {
                                    return (
                                        <FormItem
                                        key={item}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                        <FormControl>
                                            <Checkbox
                                            checked={field.value?.includes(item)}
                                            onCheckedChange={(checked) => {
                                                return checked
                                                ? field.onChange([...(field.value || []), item])
                                                : field.onChange(
                                                    field.value?.filter(
                                                        (value) => value !== item
                                                    )
                                                    )
                                            }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal capitalize">
                                            {item}
                                        </FormLabel>
                                        </FormItem>
                                    )
                                    }}
                                />
                                ))}
                            </div>
                            <FormMessage />
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
