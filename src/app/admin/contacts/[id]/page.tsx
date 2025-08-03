
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Contact } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, User, Tag, FileText } from 'lucide-react';

// En una aplicación real, esto obtendría los datos de una base de datos (ej. Firestore)
const dummyContacts: Contact[] = [
  { id: '1', firstname: 'John', firstlastname: 'Doe', email: 'john.doe@example.com', notes: 'Estoy interesado en la Villa Moderna. ¿Puedo obtener más detalles?', date: '2024-05-20', types: ['comprador'], phone: '987654321' },
  { id: '2', firstname: 'Jane', firstlastname: 'Smith', email: 'jane.smith@example.com', notes: 'Por favor, programar una visita para el Penthouse del centro.', date: '2024-05-19', types: ['arrendatario'], phone: '987654322' },
  { id: '3', firstname: 'Sam', firstlastname: 'Wilson', email: 'sam.wilson@example.com', notes: '¿Cuáles son las opciones de financiamiento disponibles?', date: '2024-05-18', types: ['vendedor', 'arrendador'], phone: '987654323' },
];

const getContactById = (id: string): Contact | undefined => {
  return dummyContacts.find(c => c.id === id);
};

const getFullName = (contact: Pick<Contact, 'firstname' | 'secondname' | 'firstlastname' | 'secondlastname'>) => {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}


export default function ContactDetailsPage({ params }: { params: { id: string } }) {
  const contact = getContactById(params.id);

  if (!contact) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Contacto no encontrado</h1>
        <Button asChild>
          <Link href="/admin/contacts">
            <ArrowLeft className="mr-2" />
            Volver a Contactos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/contacts">
                    <ArrowLeft className="mr-2" />
                    Volver a Contactos
                </Link>
            </Button>
        </div>

        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                           <User /> {getFullName(contact)}
                        </CardTitle>
                        <CardDescription>
                            Detalles del contacto y notas.
                        </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                       <Calendar size={16} />
                       <span>Contactado el: {new Date(contact.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="text-muted-foreground" size={20} />
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                        </div>
                        {contact.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="text-muted-foreground" size={20} />
                                <span>{contact.phone}</span>
                            </div>
                        )}
                         <div className="flex items-start gap-3">
                            <Tag className="text-muted-foreground mt-1" size={20} />
                            <div className="flex flex-wrap gap-2">
                                {contact.types.map(type => (
                                    <Badge key={type} variant="secondary" className="capitalize text-sm">{type}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-6 border-t">
                    <h4 className="font-semibold flex items-center gap-2 text-lg"><FileText size={20}/> Notas</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-md">{contact.notes || 'No hay notas para este contacto.'}</p>
                </div>

            </CardContent>
        </Card>
    </div>
  );
}
