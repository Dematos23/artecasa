
'use server';

import { db } from '@/lib/firebase-admin'; // Using Admin SDK
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// NOTE: This file uses the Firebase Admin SDK and should only contain server-side logic.
// It has privileged access to the database and can bypass security rules.

/**
 * Creates a relationship document linking a subject (client or contact) to a property.
 * This is a privileged action performed on the server.
 */
export async function createRelation({
    actorTenantId,
    subjectType,
    subjectId,
    propertyTenantId,
    propertyId,
    role,
    source,
    status = 'new',
}: {
    actorTenantId: string;
    subjectType: 'client' | 'contact';
    subjectId: string;
    propertyTenantId: string;
    propertyId: string;
    role: 'Owner' | 'Interested' | 'Applicant' | 'Tenant' | 'Buyer';
    source: 'client-favorite' | 'agent-link' | 'import';
    status?: 'new' | 'verified' | 'matched' | 'rejected';
}) {
    try {
        const relationsCollection = db.collection(`tenants/${actorTenantId}/relations`);
        await relationsCollection.add({
            tenantId: actorTenantId,
            subjectType,
            subjectId,
            propertyTenantId,
            propertyId,
            role,
            source,
            status,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating relation:', error);
        throw new Error('Could not create the relationship.');
    }
}
