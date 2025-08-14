
'use server';

import { db } from '@/lib/firebase-admin';
import { FieldValue, Filter } from 'firebase-admin/firestore';
import type { RelationRole, RelationStatus } from '@/types/multitenant';

/**
 * Creates a relation document in Firestore for a client who has favorited a property.
 * This function is idempotent and will not create a duplicate relation
 * for the same client and property.
 *
 * @param {object} params - The parameters for creating the relation.
 * @param {string} params.propertyTenantId - The ID of the tenant who owns the property.
 * @param {string} params.propertyId - The ID of the property.
 * @param {string} params.clientId - The ID of the client who favorited the property.
 * @param {boolean} params.consentSharedWithAgents - Flag indicating if the client consented to share info.
 */
export async function createRelationForClientFavorite({
    propertyTenantId,
    propertyId,
    clientId,
    consentSharedWithAgents,
}: {
    propertyTenantId: string;
    propertyId: string;
    clientId: string;
    consentSharedWithAgents: boolean;
}): Promise<void> {
    if (!consentSharedWithAgents) {
        console.log(`Consent not given for client ${clientId}. Skipping relation creation.`);
        return;
    }

    try {
        const relationsCollection = db.collection(`tenants/${propertyTenantId}/relations`);

        // Idempotency check: prevent duplicate 'Interested' relations from client favorites
        const existingRelationQuery = await relationsCollection.where(
            Filter.and(
                Filter.where('subjectType', '==', 'client'),
                Filter.where('subjectId', '==', clientId),
                Filter.where('propertyId', '==', propertyId),
                Filter.where('role', '==', 'Interested')
            )
        ).limit(1).get();

        if (!existingRelationQuery.empty) {
            console.log(`Relation for client ${clientId} and property ${propertyId} already exists.`);
            return;
        }

        await relationsCollection.add({
            tenantId: propertyTenantId,
            subjectType: 'client',
            subjectId: clientId,
            propertyTenantId,
            propertyId,
            role: 'Interested',
            source: 'client-favorite',
            status: 'new',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`Successfully created 'client-favorite' relation for client ${clientId} on property ${propertyId}.`);
    } catch (error) {
        console.error('Error creating relation for client favorite:', error);
        // We throw the error so the calling function can handle it if needed,
        // but for a background task like this, we might also just log it.
        throw new Error('Could not create the relationship due to a server error.');
    }
}

/**
 * Creates a relation document linking a CRM contact to a property.
 * This is initiated by an agent within their CRM.
 *
 * @param {object} params - The parameters for creating the relation.
 * @param {string} params.agentTenantId - The tenant ID of the agent creating the relation.
 * @param {string} params.contactId - The ID of the contact in the agent's CRM.
 * @param {string} params.propertyTenantId - The tenant ID of the property owner.
 * @param {string} params.propertyId - The ID of the property.
 * @param {RelationRole} params.role - The role of the contact in relation to the property (e.g., 'Owner', 'Interested').
 * @param {RelationStatus} params.status - The current status of the relation (e.g., 'new', 'verified').
 */
export async function createRelationForContact({
    agentTenantId,
    contactId,
    propertyTenantId,
    propertyId,
    role,
    status,
}: {
    agentTenantId: string;
    contactId: string;
    propertyTenantId: string;
    propertyId: string;
    role: RelationRole;
    status: RelationStatus;
}): Promise<void> {
    try {
        const relationsCollection = db.collection(`tenants/${agentTenantId}/relations`);
        await relationsCollection.add({
            tenantId: agentTenantId,
            subjectType: 'contact',
            subjectId: contactId,
            propertyTenantId,
            propertyId,
            role,
            status,
            source: 'agent-link',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`Successfully created 'agent-link' relation by tenant ${agentTenantId} for contact ${contactId}.`);
    } catch (error) {
        console.error('Error creating relation for contact:', error);
        throw new Error('Could not create the relationship due to a server error.');
    }
}
