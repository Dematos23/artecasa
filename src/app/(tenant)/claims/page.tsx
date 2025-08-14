

"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { documentTypes } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { handleClaimSubmit } from '@/actions/claims';
import { useTenant } from '@/context/TenantContext';

const claimSchema = z.object({
  fullName: z.string().min(3, 'El nombre es muy corto.'),
  documentType: z.enum(documentTypes),
  documentNumber: z.string().min(5, 'El número de documento es muy corto.'),
  phone: z.string().min(7, 'El teléfono es muy corto.'),
  email: z.string().email('Correo electrónico no válido.'),
  address: z.string().min(5, 'La dirección es muy corta.'),
  productOrService: z.string().min(3, 'El detalle del producto/servicio es muy corto.'),
  claimedAmount: z.coerce.number().min(0, 'El monto debe ser un número positivo.'),
  description: z.string().min(10, 'La descripción es muy corta.').max(1000, 'La descripción es muy larga.'),
  clientRequest: z.string().min(10, 'El pedido es muy corto.').max(1000, 'El pedido es muy largo.'),
});

type ClaimFormValues = z.infer<typeof claimSchema>;

export default function ClaimsPage() {
    const { tenantId } = useTenant();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ClaimFormValues>({
        resolver: zodResolver(claimSchema),
        defaultValues: {
            fullName: '',
            documentNumber: '',
            phone: '',
            email: '',
            address: '',
            productOrService: '',
            claimedAmount: 0,
            description: '',
            clientRequest: '',
        }
    });

    const onSubmit = async (data: ClaimFormValues) => {
        if (!tenantId) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo identificar la inmobiliaria. Inténtalo de nuevo." });
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await handleClaimSubmit({...data, tenantId});
            if(result.success) {
                toast({
                    title: "Reclamo Enviado",
                    description: `Tu reclamo ha sido registrado con el código: ${result.correlative}`,
                });
                form.reset();
            } else {
                 toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "No se pudo enviar tu reclamo.",
                });
            }
        } catch (error) {
            console.error("Error submitting claim:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo enviar tu reclamo. Por favor, inténtalo de nuevo más tarde.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <div className="container mx-auto py-12 md:py-24 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Libro de Reclamaciones</CardTitle>
          <CardDescription>
            Conforme a lo establecido en el Código de Protección y Defensa del Consumidor, esta institución cuenta con un Libro de Reclamaciones a tu disposición.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2">1. Identificación del Consumidor Reclamante</h3>
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="documentType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Documento de Identidad</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {documentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="documentNumber" render={({ field }) => (
                            <FormItem><FormLabel>Nro. Documento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                     </div>
                     <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    
                    <h3 className="font-semibold text-lg border-b pb-2 pt-4">2. Identificación del Bien Contratado</h3>
                     <FormField control={form.control} name="productOrService" render={({ field }) => (
                        <FormItem><FormLabel>Producto o Servicio</FormLabel><FormControl><Input placeholder="Ej: Asesoría inmobiliaria para compra de propiedad X" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="claimedAmount" render={({ field }) => (
                        <FormItem><FormLabel>Monto Reclamado (S/.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <h3 className="font-semibold text-lg border-b pb-2 pt-4">3. Detalle de la Reclamación</h3>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="clientRequest" render={({ field }) => (
                        <FormItem><FormLabel>Pedido del Cliente</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>

                    <div className="text-xs text-muted-foreground">
                        *RECLAMO: Disconformidad relacionada a los productos o servicios.
                        <br/>
                        *QUEJA: Disconformidad no relacionada a los productos o servicios; o, malestar o descontento respecto a la atención al público.
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : 'Enviar Reclamo'}
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
