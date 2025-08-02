import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';

async function handleContactSubmit(formData: FormData) {
  'use server';
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  console.log('New Contact Submission:', { name, email, message });
  // Here you would typically save to a database (e.g., Firestore)
  // and/or send an email notification.
}

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 md:py-24 px-[3%] md:px-[5%] xl:px-[12%]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Contáctanos</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Estamos aquí para ayudarte a encontrar la casa de tus sueños. Contáctanos con cualquier pregunta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
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
                  <Input id="name" name="name" type="text" placeholder="Tu Nombre" required />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Correo Electrónico</label>
                  <Input id="email" name="email" type="email" placeholder="Tu Correo Electrónico" required />
                </div>
                <div>
                  <label htmlFor="phone" className="sr-only">Teléfono</label>
                  <Input id="phone" name="phone" type="tel" placeholder="Tu Teléfono (Opcional)" />
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">Mensaje</label>
                  <Textarea id="message" name="message" placeholder="Tu Mensaje" required rows={5} />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" className="flex-1">Enviar Mensaje</Button>
                  <Button asChild variant="outline" className="flex-1 border-green-500 text-green-600 hover:bg-green-500 hover:text-white">
                    <Link href="https://wa.me/1234567890" target="_blank">
                      <MessageCircle className="mr-2" /> WhatsApp
                    </Link>
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
