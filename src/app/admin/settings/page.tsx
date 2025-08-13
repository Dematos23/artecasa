
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getSettings, saveSettings } from '@/services/settings';
import { useAuth } from '@/context/AuthContext';
import { generateThemeFromSettings } from '@/actions/settings';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from '@/lib/firebase';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ColorPicker } from '@/components/ui/color-picker';
import { useTenant } from '@/context/TenantContext';
import type { TenantSettings } from '@/types/multitenant';

const storage = getStorage(app);

const settingsSchema = z.object({
  logoUrl: z.string().optional(),
  defaultPropertyImageUrl: z.string().optional(),
  heroImages: z.array(z.string()).optional().default([]),

  whatsappNumber: z.string().min(1, 'El número de WhatsApp es obligatorio.').regex(/^\d+$/, 'Debe contener solo números.'),
  claimsEmail: z.string().email({ message: "Debe ser un correo electrónico válido." }).optional().or(z.literal('')),
  
  facebookUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  instagramUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  tiktokUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  xUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  youtubeUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  whatsappUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  linkedinUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
  telegramUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),

  showFacebook: z.boolean().optional(),
  showInstagram: z.boolean().optional(),
  showTiktok: z.boolean().optional(),
  showX: z.boolean().optional(),
  showYoutube: z.boolean().optional(),
  showWhatsapp: z.boolean().optional(),
  showLinkedin: z.boolean().optional(),
  showTelegram: z.boolean().optional(),

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

  // Theme settings
  primaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  accentColor: z.string().optional(),
  bodyFont: z.string().optional(),
  headlineFont: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const fontOptions = ['Montserrat', 'Lato', 'Roboto', 'Oswald', 'Raleway', 'Merriweather', 'Playfair Display'];


const SingleImageUploader = ({
  label,
  currentImageUrl,
  onImageChange,
}: {
  label: string;
  currentImageUrl: string | null | undefined;
  onImageChange: (file: File | null) => void;
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {preview ? (
          <Image
            src={preview}
            alt={`${label} preview`}
            width={100}
            height={100}
            className="h-20 w-auto object-contain rounded-md border p-1"
          />
        ) : (
          <div className="h-20 w-20 flex items-center justify-center bg-secondary rounded-md text-muted-foreground text-sm">
            Sin imagen
          </div>
        )}
        <Button type="button" variant="outline" onClick={handleButtonClick}>
          {preview ? 'Cambiar Imagen' : 'Subir Imagen'}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};


export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { tenantId } = useTenant();
  const [settingsLoading, setSettingsLoading] = useState(true);
  const isLoading = authLoading || settingsLoading;
  const { toast } = useToast();
  // Hero images state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  // Single image state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [defaultPropertyImageFile, setDefaultPropertyImageFile] = useState<File | null>(null);


  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      heroImages: [],
      whatsappNumber: '',
      claimsEmail: '',
      facebookUrl: '',
      instagramUrl: '',
      tiktokUrl: '',
      xUrl: '',
      youtubeUrl: '',
      whatsappUrl: '',
      linkedinUrl: '',
      telegramUrl: '',
      showFacebook: false,
      showInstagram: false,
      showTiktok: false,
      showX: false,
      showYoutube: false,
      showWhatsapp: false,
      showLinkedin: false,
      showTelegram: false,
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
      primaryColor: '',
      backgroundColor: '',
      accentColor: '',
      bodyFont: 'Montserrat',
      headlineFont: 'Montserrat',
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      if (!tenantId) return;
      setSettingsLoading(true);
      try {
        const settings = await getSettings(tenantId);
        if (settings) {
          form.reset(settings as any);
          setImagePreviews(settings.heroImages || []);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las configuraciones.",
        });
      } finally {
        setSettingsLoading(false);
      }
    }

    if (user) {
      fetchSettings();
    }
  }, [form, toast, user, tenantId]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
        setNewImageFiles(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const existingUrls = form.getValues('heroImages') || [];
    const urlToRemove = imagePreviews[indexToRemove];

    if (existingUrls.includes(urlToRemove)) {
        setImagesToDelete(prev => [...prev, urlToRemove]);
    } else {
        const fileIndex = newImageFiles.findIndex(file => URL.createObjectURL(file) === urlToRemove);
        if (fileIndex > -1) {
            const updatedFiles = [...newImageFiles];
            updatedFiles.splice(fileIndex, 1);
            setNewImageFiles(updatedFiles);
        }
    }
    
    const newPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setImagePreviews(newPreviews);

    if (urlToRemove.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRemove);
    }
  };


  const uploadSingleImage = async (file: File, path: string, oldUrl?: string): Promise<string> => {
      // Delete old image if it exists
      if (oldUrl) {
          try {
              const oldImageRef = ref(storage, oldUrl);
              await deleteObject(oldImageRef);
          } catch (error: any) {
              if (error.code !== 'storage/object-not-found') {
                  console.error(`Error deleting old image from ${path}:`, error);
              }
          }
      }
      // Upload new image
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
  };


  const onSubmit = async (data: SettingsFormValues) => {
    if (!tenantId) return;
    try {
      let { logoUrl, defaultPropertyImageUrl } = data;

      // 1. Upload Logo and Default Property Image if they have changed
      if (logoFile) {
        logoUrl = await uploadSingleImage(logoFile, 'branding', data.logoUrl);
      }
      if (defaultPropertyImageFile) {
        defaultPropertyImageUrl = await uploadSingleImage(defaultPropertyImageFile, 'branding', data.defaultPropertyImageUrl);
      }
      
      // 2. Delete hero images marked for deletion
      await Promise.all(
        imagesToDelete.map(async (url) => {
          try {
            const imageRef = ref(storage, url);
            await deleteObject(imageRef);
          } catch (error: any) {
             if (error.code !== 'storage/object-not-found') {
                console.error("Error deleting image from storage: ", error);
             }
          }
        })
      );

      // 3. Upload new hero images
      const uploadedImageUrls = await Promise.all(
          newImageFiles.map(async (file) => {
              const storageRef = ref(storage, `hero/${Date.now()}_${file.name}`);
              await uploadBytes(storageRef, file);
              return getDownloadURL(storageRef);
          })
      );

      // 4. Combine old and new hero URLs
      const existingUrls = form.getValues('heroImages')?.filter(url => !imagesToDelete.includes(url)) || [];
      const finalImageUrls = [...existingUrls, ...uploadedImageUrls];
      
      const settingsData: TenantSettings = {
        ...data,
        logoUrl,
        defaultPropertyImageUrl,
        heroImages: finalImageUrls,
      };
      
      await saveSettings(tenantId, settingsData);
      
      await generateThemeFromSettings(settingsData);

      toast({
        title: "Éxito",
        description: "La configuración se ha guardado correctamente. Los cambios pueden tardar unos momentos en reflejarse.",
      });
      
      setTimeout(() => window.location.reload(), 1500);


    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración.",
      });
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Configuración General</h1>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

               <Card>
                <CardHeader>
                  <CardTitle>Branding y Medios</CardTitle>
                  <CardDescription>
                    Gestiona el logo del sitio y otras imágenes por defecto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SingleImageUploader
                    label="Logo del Sitio"
                    currentImageUrl={form.watch('logoUrl')}
                    onImageChange={setLogoFile}
                  />
                  <hr/>
                   <SingleImageUploader
                    label="Imagen por Defecto para Propiedades"
                    currentImageUrl={form.watch('defaultPropertyImageUrl')}
                    onImageChange={setDefaultPropertyImageFile}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Imágenes del Carrusel Principal (Hero)</CardTitle>
                  <CardDescription>
                    Sube, elimina y gestiona las imágenes que aparecen en el carrusel de la página de inicio.
                  </CardDescription>
                </CardHeader>
                 <CardContent>
                    <div>
                      <Label>Imágenes</Label>
                      <FormControl>
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10">
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-300" />
                                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-accent-foreground" >
                                        <span>Sube tus archivos</span>
                                        <input id="file-upload" name="newImages" type="file" className="sr-only" multiple onChange={handleImageChange} accept="image/*" />
                                    </label>
                                    <p className="pl-1">o arrástralos aquí</p>
                                </div>
                                <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF hasta 10MB</p>
                            </div>
                        </div>
                      </FormControl>
                       {imagePreviews.length > 0 && (
                         <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {imagePreviews.map((previewUrl, index) => (
                               <div key={previewUrl + index} className="relative group">
                                 <Image src={previewUrl} alt={`Vista previa de imagen ${index + 1}`} width={150} height={150} className="h-24 w-24 object-cover rounded-md" />
                                  <div className="absolute top-0 right-0 -mt-2 -mr-2 flex gap-1">
                                    <button type="button" onClick={() => removeImage(index)} title="Eliminar imagen" className="h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" >
                                        <X className="h-4 w-4" />
                                    </button>
                                  </div>
                               </div>
                            ))}
                         </div>
                       )}
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Apariencia del Sitio</CardTitle>
                  <CardDescription>
                    Personaliza los colores y la tipografía de tu sitio web.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Primario</FormLabel>
                          <FormControl>
                            <ColorPicker
                              hsl={field.value}
                              onHslChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color de Fondo</FormLabel>
                          <FormControl>
                            <ColorPicker
                              hsl={field.value}
                              onHslChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color de Énfasis</FormLabel>
                          <FormControl>
                            <ColorPicker
                              hsl={field.value}
                              onHslChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="bodyFont" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fuente Principal</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {fontOptions.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="headlineFont" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fuente de Encabezados</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                     {fontOptions.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                      )}/>
                   </div>
                </CardContent>
              </Card>

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
                    Ingresa las URLs completas de tus perfiles y activa los que quieras mostrar en el pie de página.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    
                    <FormField control={form.control} name="showFacebook" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Facebook</FormLabel>
                                <FormControl><Input className='mt-2' placeholder="https://facebook.com/tu-pagina" {...form.register('facebookUrl')} /></FormControl>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}/>
                    
                    <FormField control={form.control} name="showInstagram" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Instagram</FormLabel>
                                <FormControl><Input className='mt-2' placeholder="https://instagram.com/tu-usuario" {...form.register('instagramUrl')} /></FormControl>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}/>
                    
                    <FormField control={form.control} name="showTiktok" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">TikTok</FormLabel>
                                <FormControl><Input className='mt-2' placeholder="https://tiktok.com/@tu-usuario" {...form.register('tiktokUrl')} /></FormControl>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="showX" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">X (Twitter)</FormLabel>
                                <FormControl><Input className='mt-2' placeholder="https://x.com/tu-usuario" {...form.register('xUrl')} /></FormControl>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}/>

                     <FormField control={form.control} name="showYoutube" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">YouTube</FormLabel>
                                <FormControl><Input className='mt-2' placeholder="https://youtube.com/tu-canal" {...form.register('youtubeUrl')} /></FormControl>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}/>

                     <FormField control={form.control} name="showWhatsapp" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">WhatsApp</FormLabel>
                                <FormControl><Input className='mt-2' placeholder="https://wa.me/..." {...form.register('whatsappUrl')} /></FormControl>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}/>

                     <FormField control={form.control} name="showLinkedin" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">LinkedIn</FormLabel>
                                <FormControl><Input className='mt-2' placeholder="https://linkedin.com/in/tu-perfil" {...form.register('linkedinUrl')} /></FormControl>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="showTelegram" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Telegram</FormLabel>
                                <FormControl><Input className='mt-2' placeholder="https://t.me/tu-usuario" {...form.register('telegramUrl')} /></FormControl>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}/>

                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Contacto</CardTitle>
                  <CardDescription>
                    Configuraciones para el formulario de contacto y el libro de reclamaciones.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                        <FormItem>
                        <Label htmlFor="whatsappNumber">Número de WhatsApp (para consultas)</Label>
                        <FormControl>
                            <Input id="whatsappNumber" placeholder="Ej: 51987654321" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="claimsEmail"
                    render={({ field }) => (
                        <FormItem>
                        <Label htmlFor="claimsEmail">Correo para Libro de Reclamaciones</Label>
                        <FormControl>
                            <Input id="claimsEmail" placeholder="reclamaciones@empresa.com" {...field} />
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
