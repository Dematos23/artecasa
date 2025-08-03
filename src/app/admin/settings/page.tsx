
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getSettings, saveSettings } from '@/services/settings';


const settingsSchema = z.object({
  whatsappNumber: z.string().min(1, 'El número de WhatsApp es obligatorio.').regex(/^\d+$/, 'Debe contener solo números.'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      whatsappNumber: '',
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSettings();
        if (settings) {
          form.reset({ whatsappNumber: settings.whatsappNumber });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las configuraciones.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [form, toast]);


  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await saveSettings(data);
      toast({
        title: "Éxito",
        description: "La configuración se ha guardado correctamente.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración.",
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Configuración General</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Configuración de WhatsApp</CardTitle>
          <CardDescription>
            Ingresa el número de teléfono de WhatsApp (solo números, incluyendo el código de país) para la integración en el formulario de contacto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando configuración...</p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
                      <FormControl>
                        <Input id="whatsappNumber" placeholder="Ej: 51987654321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
