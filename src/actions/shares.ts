
'use server';

import { db } from '@/lib/firebase-admin';
import { FieldValue, Filter } from 'firebase-admin/firestore';
import type { Share } from '@/types/multitenant';

/**
 * Creates a shareable list of properties with a unique token.
 *
 * @param {string} tenantId - The ID of the tenant creating the share.
 * @param {object} params - The parameters for the share list.
 * @param {Array<{ propertyTenantId: string; propertyId: string; }>} params.properties - List of properties to share.
 * @param {string} params.createdBy - The UID of the agent creating the list.
 * @param {string} [params.contactId] - Optional contact ID to associate with the list.
 * @returns {Promise<{ shareId: string; token: string; }>} The ID and token of the newly created share.
 */
export async function createShareList(
    tenantId: string,
    { properties, createdBy, contactId }: {
        properties: Array<{ propertyTenantId: string; propertyId: string; }>;
        createdBy: string;
        contactId?: string;
    }
): Promise<{ shareId: string; token: string; }> {
    try {
        const sharesCollection = db.collection(`tenants/${tenantId}/shares`);
        // Generate a cryptographically secure random token
        const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');

        const newShareRef = await sharesCollection.add({
            token,
            properties,
            contactId: contactId || null,
            createdBy: createdBy,
            createdAt: FieldValue.serverTimestamp(),
        });

        return { shareId: newShareRef.id, token };

    } catch (error) {
        console.error('Error creating shareable list:', error);
        throw new Error('Could not create shareable list.');
    }
}

/**
 * Retrieves a share document by its unique token.
 * This function uses a collectionGroup query and should be used server-side.
 *
 * @param {string} token - The unique token of the share to retrieve.
 * @returns {Promise<Share | null>} The share data or null if not found.
 */
export async function getShareByToken(token: string): Promise<Share | null> {
    try {
        const sharesQuery = await db.collectionGroup('shares')
            .where('token', '==', token)
            .limit(1)
            .get();

        if (sharesQuery.empty) {
            return null;
        }

        const shareDoc = sharesQuery.docs[0];
        return { id: shareDoc.id, ...shareDoc.data() } as Share;
    } catch (error) {
        console.error('Error retrieving share by token:', error);
        throw new Error('Could not retrieve share information.');
    }
}


/**
 * Deletes a share document, effectively revoking the public link.
 *
 * @param {string} tenantId - The ID of the tenant who owns the share.
 * @param {string} shareId - The ID of the share to delete.
 */
export async function revokeShare(tenantId: string, shareId: string): Promise<void> {
    try {
        const shareRef = db.doc(`tenants/${tenantId}/shares/${shareId}`);
        await shareRef.delete();
    } catch (error) {
        console.error('Error revoking share:', error);
        throw new Error('Could not revoke the shareable list.');
    }
}
