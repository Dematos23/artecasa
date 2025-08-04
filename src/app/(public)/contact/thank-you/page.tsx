import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="container mx-auto py-12 md:py-24 px-4 md:px-6 flex items-center justify-center">
      <Card className="max-w-lg text-center">
        <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          <CardTitle className="text-3xl font-bold font-headline mt-4">¡Gracias por contactarnos!</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
