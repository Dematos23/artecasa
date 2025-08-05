
'use server';

import { z } from 'zod';
import { getSettings } from '@/services/settings';
import { addClaim } from '@/services/claims';
import { documentTypes } from '@/types';

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

type ClaimInput = z.infer<typeof ClaimInputSchema>;

export async function handleClaimSubmit(input: ClaimInput) {
    try {
        // 1. Save claim to Firestore and get correlative
        const correlative = await addClaim(input);

        // 2. Get company email from settings
        const settings = await getSettings();
        const companyEmail = settings?.claimsEmail;
        if (!companyEmail) {
            throw new Error("Claims email not configured in settings.");
        }
        
        // 3. Generate email content from a simple template
        const emailContent = `
        Estimado/a ${input.fullName},

        Hemos recibido su reclamo y le confirmamos su registro con la siguiente información. Esta es una copia de su reclamo:

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

        Su reclamo será atendido según los plazos legales establecidos. Gracias por comunicarse con nosotros.

        Atentamente,
        El equipo de Artecasa
        `.trim();
        
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
        
        return { success: true, correlative };

    } catch (error) {
        console.error("Error processing claim:", error);
        return { success: false, error: (error as Error).message };
    }
}
