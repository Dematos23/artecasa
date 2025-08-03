
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Contact, ContactStatus } from '@/types';
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
import React, { useEffect } from 'react';

const contactSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es obligatorio.' }),
  email: z.string().email({ message: 'Debe ser un correo electrónico válido.' }),
  message: z.string().min(1, { message: 'El mensaje es obligatorio.' }),
  status: z.enum(['Nuevo', 'Contactado', 'Resuelto'], {
    required_error: 'Debes seleccionar un estado.',
  }),
});

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Omit<Contact, 'id' | 'date'>) => void;
  contact?: Contact;
}

export function ContactForm({ isOpen, onClose, onSave, contact }: ContactFormProps) {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact || {
        name: '',
        email: '',
        message: '',
        status: 'Nuevo',
    },
  });

  useEffect(() => {
    form.reset(contact || {
        name: '',
        email: '',
        message: '',
        status: 'Nuevo',
    });
  }, [contact, form, isOpen]);

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    onSave(values);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
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
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Escribe el mensaje del contacto..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Nuevo">Nuevo</SelectItem>
                                    <SelectItem value="Contactado">Contactado</SelectItem>
                                    <SelectItem value="Resuelto">Resuelto</SelectItem>
                                </SelectContent>
                            </Select>
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
