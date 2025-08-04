
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Contact, Property, AssociationType } from '@/types';
import React, { useEffect, useMemo } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const associationSchema = z.object({
  associationType: z.enum(['owner', 'interested', 'inquilino'], {
    required_error: 'Debes seleccionar un tipo de asociación.',
  }),
});

type AssociationFormValues = z.infer<typeof associationSchema>;

interface EditAssociationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyId: string, newType: AssociationType) => void;
  contact: Contact;
  property: Property;
}

export function EditAssociationForm({ isOpen, onClose, onSave, contact, property }: EditAssociationFormProps) {
  
  const getCurrentAssociationType = useMemo(() => {
    if (contact.ownerOfPropertyIds?.includes(property.id)) return 'owner';
    if (contact.interestedInPropertyIds?.includes(property.id)) return 'interested';
    if (contact.tenantOfPropertyId === property.id) return 'inquilino';
    return 'interested'; // Default fallback
  }, [contact, property]);

  const form = useForm<AssociationFormValues>({
    resolver: zodResolver(associationSchema),
    defaultValues: {
      associationType: getCurrentAssociationType,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ associationType: getCurrentAssociationType });
    }
  }, [isOpen, getCurrentAssociationType, form]);

  const onSubmit = (values: AssociationFormValues) => {
    onSave(property.id, values.associationType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className='font-headline'>Editar Asociación</DialogTitle>
          <DialogDescription>
            Modifica el tipo de relación entre {contact.firstname} y la propiedad "{property.title}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div>
            <Label>Tipo de Asociación</Label>
            <RadioGroup
              onValueChange={(value) => form.setValue("associationType", value as AssociationType)}
              defaultValue={form.getValues("associationType")}
              className="mt-2 grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner" className="font-normal">Propietario</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interested" id="interested" />
                <Label htmlFor="interested" className="font-normal">Interesado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inquilino" id="inquilino" />
                <Label htmlFor="inquilino" className="font-normal">Inquilino</Label>
              </div>
            </RadioGroup>
            {form.formState.errors.associationType && <p className="text-sm font-medium text-destructive">{form.formState.errors.associationType.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
