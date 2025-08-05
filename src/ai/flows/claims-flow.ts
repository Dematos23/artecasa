
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getSettings } from '@/services/settings';
import { addClaim } from '@/services/claims';
import { documentTypes, DocumentType } from '@/types';
import {generate} from 'genkit/generate';

const ClaimInputSchema = z.object({
  fullName: z.string(),
  documentType: z.enum(documentTypes),
  documentNumber: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  productOrService: z.string(),
  claimedAmount: z.number(),
  description: z.string(),
  clientRequest: z.string(),
});
export type ClaimInput = z.infer<typeof ClaimInputSchema>;

const ClaimOutputSchema = z.object({
  correlative: z.string(),
  message: z.string(),
});
export type ClaimOutput = z.infer<typeof ClaimOutputSchema>;


const claimsFlow = ai.defineFlow(
  {
    name: 'claimsFlow',
    inputSchema: ClaimInputSchema,
    outputSchema: ClaimOutputSchema,
  },
  async (input) => {
    // 1. Save claim to Firestore and get correlative
    const correlative = await addClaim(input);

    // 2. Get company email from settings
    const settings = await getSettings();
    const companyEmail = settings?.claimsEmail;
    if (!companyEmail) {
        throw new Error("Claims email not configured in settings.");
    }
    
    // 3. Generate email content
    const emailPrompt = `
      Genera un correo electrónico de confirmación para un libro de reclamaciones.
      El correo debe ser formal y claro.
      Incluye TODA la siguiente información del reclamo, bien formateada.
      No agregues ninguna nota, comentario o texto adicional que no sea parte del cuerpo del correo.

      - Código de Reclamo: ${correlative}
      - Nombre Completo: ${input.fullName}
      - Documento: ${input.documentType} - ${input.documentNumber}
      - Teléfono: ${input.phone}
      - Correo Electrónico: ${input.email}
      - Domicilio: ${input.address}
      - Producto/Servicio: ${input.productOrService}
      - Monto Reclamado: S/ ${input.claimedAmount.toFixed(2)}
      - Descripción del Reclamo: ${input.description}
      - Pedido del Cliente: ${input.clientRequest}

      Finaliza el correo indicando que el reclamo será atendido según los plazos legales.
    `;
    
    const { output: emailContent } = await generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: emailPrompt,
    });
    
    // This is a placeholder for sending an email.
    // In a real application, you would integrate an email service like SendGrid, Resend, etc.
    console.log("--- EMAIL TO CLIENT ---");
    console.log(`To: ${input.email}`);
    console.log(`Subject: Confirmación de Reclamo - Código: ${correlative}`);
    console.log(`Body: ${emailContent}`);
    console.log("-----------------------");
    
    console.log("--- EMAIL TO COMPANY ---");
    console.log(`To: ${companyEmail}`);
    console.log(`Subject: Nuevo Reclamo Registrado - Código: ${correlative}`);
    console.log(`Body: ${emailContent}`);
    console.log("------------------------");
    
    return {
        correlative,
        message: 'Claim processed successfully.'
    };
  }
);


export async function processClaim(input: ClaimInput): Promise<ClaimOutput> {
  return claimsFlow(input);
}
