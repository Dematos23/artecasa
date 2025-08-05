
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
  facebookUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  instagramUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  tiktokUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  homepageTitle: z.string().optional(),
  homepageSubtitle: z.string().optional(),
  homepageHeroButtonText: z.string().optional(),
  featuredPropertyTitle: z.string().optional(),
  featuredPropertyButtonText: z.string().optional(),
  discoverPropertiesTitle: z.string().optional(),
  discoverPropertiesSubtitle: z.string().optional(),
  discoverPropertiesButtonText: z.string().optional(),
  contactTitle: z.string().optional(),
  contactSubtitle: z.string().optional(),
  contactAddressTitle: z.string().optional(),
  contactAddressContent: z.string().optional(),
  contactEmailTitle: z.string().optional(),
  contactEmailContent: z.string().optional(),
  contactPhoneTitle: z.string().optional(),
  contactPhoneContent: z.string().optional(),
  contactFormTitle: z.string().optional(),
  contactFormSubtitle: z.string().optional(),
  contactFormSubmitButtonText: z.string().optional(),
  contactFormWhatsappButtonText: z.string().optional(),
  thankYouTitle: z.string().optional(),
  thankYouSubtitle: z.string().optional(),
  thankYouButtonText: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      whatsappNumber: '',
      facebookUrl: '',
      instagramUrl: '',
      tiktokUrl: '',
      homepageTitle: '',
      homepageSubtitle: '',
      homepageHeroButtonText: '',
      featuredPropertyTitle: '',
      featuredPropertyButtonText: '',
      discoverPropertiesTitle: '',
      discoverPropertiesSubtitle: '',
      discoverPropertiesButtonText: '',
      contactTitle: '',
      contactSubtitle: '',
      contactAddressTitle: '',
      contactAddressContent: '',
      contactEmailTitle: '',
      contactEmailContent: '',
      contactPhoneTitle: '',
      contactPhoneContent: '',
      contactFormTitle: '',
      contactFormSubtitle: '',
      contactFormSubmitButtonText: '',
      contactFormWhatsappButtonText: '',
      thankYouTitle: '',
      thankYouSubtitle: '',
      thankYouButtonText: '',
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
  
  if (isLoading) {
    return <p>Cargando configuración...</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Configuración General</h1>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <Card>
                <CardHeader>
                  <CardTitle>Textos de la Página de Inicio</CardTitle>
                  <CardDescription>
                    Edita el contenido que se muestra en la página de inicio.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
 <FormField control={form.control} name="homepageTitle" render={({ field }) => (
 <FormItem>
 <Label>Título Principal (Hero)</Label>
 <FormControl>
 <Input placeholder="Artecasa" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="homepageSubtitle" render={({ field }) => (
 <FormItem>
 <Label>Subtítulo (Hero)</Label>
 <FormControl>
 <Textarea placeholder="Donde la Casa de Tus Sueños se Hace Realidad" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="homepageHeroButtonText" render={({ field }) => (
 <FormItem>
 <Label>Texto del Botón (Hero)</Label>
 <FormControl>
 <Input placeholder="Explorar Propiedades" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
                   <hr/>
 <FormField control={form.control} name="featuredPropertyTitle" render={({ field }) => (
 <FormItem>
 <Label>Título Sección Destacada</Label>
 <FormControl>
 <Input placeholder="Propiedad Destacada" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="featuredPropertyButtonText" render={({ field }) => (
 <FormItem>
 <Label>Texto Botón Sección Destacada</Label>
 <FormControl>
 <Input placeholder="Ver Detalles" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
                   <hr/>
 <FormField control={form.control} name="discoverPropertiesTitle" render={({ field }) => (
 <FormItem>
 <Label>Título Sección Descubrir</Label>
 <FormControl>
 <Input placeholder="Descubre Nuestras Propiedades" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="discoverPropertiesSubtitle" render={({ field }) => (
 <FormItem>
 <Label>Subtítulo Sección Descubrir</Label>
 <FormControl>
 <Textarea placeholder="Una cuidada selección..." {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="discoverPropertiesButtonText" render={({ field }) => (
 <FormItem>
 <Label>Texto Botón Sección Descubrir</Label>
 <FormControl>
 <Input placeholder="Ver Todas las Propiedades" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>

                </CardContent>
              </Card>

              <Card>
                <CardHeader>
 <CardTitle>Textos de la Página de Contacto</CardTitle>
 <CardDescription>
 Edita el contenido que se muestra en la página de contacto.
 </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
 <FormField control={form.control} name="contactTitle" render={({ field }) => (
 <FormItem>
 <Label>Título de la Página</Label>
 <FormControl>
 <Input placeholder="Contáctanos" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="contactSubtitle" render={({ field }) => (
 <FormItem>
 <Label>Subtítulo / Descripción</Label>
 <FormControl>
 <Textarea placeholder="Estamos aquí para ayudarte..." {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <hr/>
 <FormField control={form.control} name="contactAddressTitle" render={({ field }) => (
 <FormItem>
 <Label>Título Tarjeta Dirección</Label>
 <FormControl>
 <Input placeholder="Dirección de la Oficina" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="contactAddressContent" render={({ field }) => (
 <FormItem>
 <Label>Contenido Tarjeta Dirección</Label>
 <FormControl>
 <Input placeholder="123 Luxury Avenue..." {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <hr/>
 <FormField control={form.control} name="contactEmailTitle" render={({ field }) => (
 <FormItem>
 <Label>Título Tarjeta Correo</Label>
 <FormControl>
 <Input placeholder="Envíanos un Correo" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="contactEmailContent" render={({ field }) => (
 <FormItem>
 <Label>Contenido Tarjeta Correo</Label>
 <FormControl>
 <Input placeholder="contact@artecasa.com" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <hr/>
 <FormField control={form.control} name="contactPhoneTitle" render={({ field }) => (
 <FormItem>
 <Label>Título Tarjeta Teléfono</Label>
 <FormControl>
 <Input placeholder="Llámanos" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="contactPhoneContent" render={({ field }) => (
 <FormItem>
 <Label>Contenido Tarjeta Teléfono</Label>
 <FormControl>
 <Input placeholder="+1 (234) 567-890" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <hr/>
 <FormField control={form.control} name="contactFormTitle" render={({ field }) => (
 <FormItem>
 <Label>Título del Formulario</Label>
 <FormControl>
 <Input placeholder="Envíanos un Mensaje" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="contactFormSubtitle" render={({ field }) => (
 <FormItem>
 <Label>Subtítulo del Formulario</Label>
 <FormControl>
 <Textarea placeholder="Completa el formulario..." {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="contactFormSubmitButtonText" render={({ field }) => (
 <FormItem>
 <Label>Texto Botón de Envío</Label>
 <FormControl>
 <Input placeholder="Enviar Mensaje" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="contactFormWhatsappButtonText" render={({ field }) => (
 <FormItem>
 <Label>Texto Botón de WhatsApp</Label>
 <FormControl>
 <Input placeholder="WhatsApp" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>

                </CardContent>
              </Card>

               <Card>
                <CardHeader>
                  <CardTitle>Textos de la Página de Agradecimiento</CardTitle>
                  <CardDescription>
                    Edita el contenido que se muestra después de que un usuario envía el formulario de contacto.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
 <FormField control={form.control} name="thankYouTitle" render={({ field }) => (
 <FormItem>
 <Label>Título de Agradecimiento</Label>
 <FormControl>
 <Input placeholder="¡Gracias por contactarnos!" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="thankYouSubtitle" render={({ field }) => (
 <FormItem>
 <Label>Subtítulo de Agradecimiento</Label>
 <FormControl>
 <Textarea placeholder="Hemos recibido tu mensaje..." {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
 <FormField control={form.control} name="thankYouButtonText" render={({ field }) => (
 <FormItem>
 <Label>Texto del Botón de Agradecimiento</Label>
 <FormControl>
 <Input placeholder="Volver al Inicio" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}/>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Redes Sociales</CardTitle>
                  <CardDescription>
                    Ingresa las URLs completas de tus perfiles de redes sociales.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                   <FormField
                    control={form.control}
                    name="facebookUrl"
                    render={({ field }) => (
                        <FormItem>
                        <Label>URL de Facebook</Label>
                        <FormControl>
                            <Input placeholder="https://facebook.com/tu-pagina" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                        <FormItem>
                        <Label>URL de Instagram</Label>
                        <FormControl>
                            <Input placeholder="https://instagram.com/tu-usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="tiktokUrl"
                    render={({ field }) => (
                        <FormItem>
                        <Label>URL de TikTok</Label>
                        <FormControl>
                            <Input placeholder="https://tiktok.com/@tu-usuario" {...field} />
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
