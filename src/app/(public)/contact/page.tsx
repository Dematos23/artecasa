
"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSettings } from '@/services/settings';
import { handleContactSubmit } from '@/actions/contact';
import type { Settings } from '@/types';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        async function fetchSettingsData() {
            const settingsData = await getSettings();
            setSettings(settingsData);
        }
        fetchSettingsData();
    }, []);

    const handleWhatsAppClick = () => {
        if (!settings?.whatsappNumber) return;
        const text = `Hola, mi nombre es ${name}.\n\nCorreo: ${email}\nTeléfono: ${phone}\n\nMensaje: ${message}`;
        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodedText}`, '_blank');
    };

  return (
    <div className="container mx-auto py-12 md:py-24 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold font-headline mb-4">{settings?.contactTitle || 'Contáctanos'}</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {settings?.contactSubtitle || 'Estamos aquí para ayudarte a encontrar la casa de tus sueños. Contáctanos con cualquier pregunta.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="text-primary" /> Dirección de la Oficina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">123 Luxury Avenue, Suite 100, Beverly Hills, CA 90210</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="text-primary" /> Envíanos un Correo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:contact@artecasa.com" className="text-muted-foreground hover:text-primary">contact@artecasa.com</a>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="text-primary" /> Llámanos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="tel:+1234567890" className="text-muted-foreground hover:text-primary">+1 (234) 567-890</a>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Envíanos un Mensaje</CardTitle>
              <CardDescription>Completa el formulario a continuación y nos pondremos en contacto contigo en breve.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">Nombre</label>
                  <Input id="name" name="name" type="text" placeholder="Tu Nombre" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Correo Electrónico</label>
                  <Input id="email" name="email" type="email" placeholder="Tu Correo Electrónico" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="phone" className="sr-only">Teléfono</label>
                  <Input id="phone" name="phone" type="tel" placeholder="Tu Teléfono (Opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">Mensaje</label>
                  <Textarea id="message" name="message" placeholder="Tu Mensaje" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" className="flex-1">Enviar Mensaje</Button>
                  <Button type="button" onClick={handleWhatsAppClick} variant="outline" className="flex-1 border-green-500 text-green-600 hover:bg-green-500 hover:text-white" disabled={!settings?.whatsappNumber}>
                      <MessageCircle className="mr-2" /> WhatsApp
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
