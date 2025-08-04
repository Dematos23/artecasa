
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Contact, Property } from '@/types';
import React, { useEffect, useState, useMemo } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUnassociatedProperties } from '@/services/contacts';
import { updateContactAssociations } from '@/services/contacts';
import { useToast } from '@/hooks/use-toast';

const associationSchema = z.object({
  propertyId: z.string().min(1, { message: 'Debes seleccionar una propiedad.' }),
  associationType: z.enum(['owner', 'interested', 'inquilino'], {
    required_error: 'Debes seleccionar un tipo de asociación.',
  }),
});

type AssociationFormValues = z.infer<typeof associationSchema>;

interface AssociatePropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAssociationSaved: () => void;
  contact: Contact;
}

export function AssociatePropertyForm({ isOpen, onClose, onAssociationSaved, contact }: AssociatePropertyFormProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCombobox, setOpenCombobox] = useState(false);
  const { toast } = useToast();

  const form = useForm<AssociationFormValues>({
    resolver: zodResolver(associationSchema),
    defaultValues: {
      propertyId: '',
      associationType: 'interested',
    },
  });

  useEffect(() => {
    async function fetchProperties() {
      if (isOpen) {
        setLoading(true);
        const unassociatedProps = await getUnassociatedProperties();
        setProperties(unassociatedProps);
        setLoading(false);
      }
    }
    fetchProperties();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (values: AssociationFormValues) => {
    try {
      await updateContactAssociations(contact.id, values.propertyId, values.associationType);
      toast({
        title: "Éxito",
        description: "El contacto ha sido asociado a la propiedad.",
      });
      onAssociationSaved();
      onClose();
    } catch (error) {
      console.error("Error associating property:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo asociar la propiedad.",
      });
    }
  };

  const selectedPropertyTitle = useMemo(() => {
    const selectedId = form.watch('propertyId');
    return properties.find(p => p.id === selectedId)?.title || "Seleccionar propiedad...";
  }, [form, properties]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className='font-headline'>Asociar a Propiedad</DialogTitle>
          <DialogDescription>
            Busca y selecciona una propiedad para asociarla a {contact.firstname}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div>
            <Label>Propiedad</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  <span className="truncate">{selectedPropertyTitle}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[360px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar propiedad..." />
                  <CommandList>
                    <CommandEmpty>{loading ? "Cargando..." : "No se encontraron propiedades."}</CommandEmpty>
                    <CommandGroup>
                      {properties.map((property) => (
                        <CommandItem
                          key={property.id}
                          value={property.id}
                          onSelect={(currentValue) => {
                            form.setValue("propertyId", currentValue === form.getValues("propertyId") ? "" : currentValue, { shouldValidate: true });
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.getValues("propertyId") === property.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {property.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {form.formState.errors.propertyId && <p className="text-sm font-medium text-destructive">{form.formState.errors.propertyId.message}</p>}
          </div>

          <div>
            <Label>Tipo de Asociación</Label>
            <RadioGroup
              onValueChange={(value) => form.setValue("associationType", value as 'owner' | 'interested' | 'inquilino')}
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
              {form.formState.isSubmitting ? "Guardando..." : "Guardar Asociación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
