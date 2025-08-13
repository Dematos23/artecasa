
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


/**
 * Handles the logic for a client toggling a favorite property.
 * It updates the client's profile and may create a `Relation` if consent is given.
 */
export async function handleFavoriteToggle({
    clientId,
    propertyTenantId,
    propertyId,
    isFavorited, // true if it's currently favorited (i.e., user wants to remove it)
    clientHasConsent, // Example flag for consent
    host
}: {
    clientId: string;
    propertyTenantId: string;
    propertyId: string;
    isFavorited: boolean;
    clientHasConsent: boolean;
    host?: string;
}) {
    const clientRef = db.collection('clients').doc(clientId);
    const interestedPropertyObject = {
        tenantId: propertyTenantId,
        propertyId,
        host: host || '',
        addedAt: FieldValue.serverTimestamp(),
    };

    try {
        if (isFavorited) {
            // Remove from favorites
            await clientRef.update({
                interestedProperties: FieldValue.arrayRemove(interestedPropertyObject)
            });
            // Note: We are not removing the relation here, as it might be useful for the agent.
            // A separate cleanup process could handle stale relations.
        } else {
            // Add to favorites
            await clientRef.update({
                interestedProperties: FieldValue.arrayUnion(interestedPropertyObject)
            });

            // If client has given consent, create a relation for the agent
            if (clientHasConsent) {
                await createRelation({
                    actorTenantId: propertyTenantId, // The relation is owned by the property's tenant
                    subjectType: 'client',
                    subjectId: clientId,
                    propertyTenantId,
                    propertyId,
                    role: 'Interested',
                    source: 'client-favorite',
                });
            }
        }

        revalidatePath('/'); // Revalidate home page or relevant property pages
        return { success: true };

    } catch (error) {
        console.error('Error handling favorite toggle:', error);
        return { success: false, error: 'Could not update favorites.' };
    }
}

/**
 * Generates a shareable link for a list of properties.
 * This would be called by an agent from the CRM.
 */
export async function createShareableList({
    agentTenantId,
    agentId,
    properties,
    contactId
}: {
    agentTenantId: string;
    agentId: string;
    properties: Array<{ propertyTenantId: string; propertyId: string; }>;
    contactId?: string;
}) {
    try {
        const sharesCollection = db.collection(`tenants/${agentTenantId}/shares`);
        const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');

        const newShareRef = await sharesCollection.add({
            token,
            properties,
            contactId: contactId || null,
            createdBy: agentId,
            createdAt: FieldValue.serverTimestamp(),
        });

        // In a real app, you would return a full URL
        const shareLink = `/shares/${newShareRef.id}?token=${token}`;
        return { success: true, link: shareLink };

    } catch (error) {
        console.error('Error creating shareable list:', error);
        return { success: false, error: 'Could not create shareable list.' };
    }
}
