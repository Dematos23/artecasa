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
import { Textarea } from '@/components/ui/textarea';


const settingsSchema = z.object({
  whatsappNumber: z.string().min(1, 'El número de WhatsApp es obligatorio.').regex(/^\d+$/, 'Debe contener solo números.'),
  homepageTitle: z.string().optional(),
  homepageSubtitle: z.string().optional(),
  contactTitle: z.string().optional(),
  contactSubtitle: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      whatsappNumber: '',
      homepageTitle: '',
      homepageSubtitle: '',
      contactTitle: '',
      contactSubtitle: '',
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settings = await getSettings();
        if (settings) {
          form.reset(settings);
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Textos de la Página de Inicio</CardTitle>
                  <CardDescription>
                    Edita el contenido que se muestra en la sección principal de la página de inicio.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                   <FormField
                      control={form.control}
                      name="homepageTitle"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Título Principal</Label>
                          <FormControl>
                            <Input placeholder="Ej: Artecasa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="homepageSubtitle"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Subtítulo</Label>
                          <FormControl>
                            <Textarea placeholder="Ej: Donde la Casa de Tus Sueños se Hace Realidad" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Textos de la Página de Contacto</CardTitle>
                  <CardDescription>
                    Edita el contenido que se muestra en la cabecera de la página de contacto.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                   <FormField
                      control={form.control}
                      name="contactTitle"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Título de la Página</Label>
                          <FormControl>
                            <Input placeholder="Ej: Contáctanos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="contactSubtitle"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Subtítulo / Descripción</Label>
                          <FormControl>
                            <Textarea placeholder="Ej: Estamos aquí para ayudarte..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>

              <Card>
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
                  )}
                </CardContent>
              </Card>

               <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
        </Form>
    </div>
  );
}
