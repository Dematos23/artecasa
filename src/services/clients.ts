
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp } from 'firebase/firestore';
import { clientProfileConverter, type ClientProfile, type InterestedProperty } from '@/types/multitenant';
import type { User } from 'firebase/auth';
import { createRelationForClientFavorite } from '@/actions/relations';

// This service is for CLIENT-SIDE operations related to the `clients` collection.
// All operations are subject to Firestore Security Rules.

const clientsCollection = collection(db, 'clients').withConverter(clientProfileConverter);

/**
 * Retrieves a client's profile from Firestore.
 */
export async function getClientProfile(clientId: string): Promise<ClientProfile | null> {
    const docRef = doc(clientsCollection, clientId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

/**
 * Creates a client profile document if it doesn't exist.
 * Typically called right after a user signs up.
 */
export async function createClientProfile(user: User): Promise<void> {
    const clientRef = doc(clientsCollection, user.uid);
    const docSnap = await getDoc(clientRef);

    if (!docSnap.exists()) {
        await setDoc(clientRef, {
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            interestedProperties: [],
            lookingFor: {},
            visibility: {
                shareWithAgents: false // Default consent to false
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
}

/**
 * Adds a property to a client's list of interested properties.
 */
export async function addInterestedProperty(clientId: string, propertyInfo: Omit<InterestedProperty, 'addedAt'>): Promise<void> {
    const clientRef = doc(clientsCollection, clientId);
    const interestedPropertyObject = {
        ...propertyInfo,
        addedAt: serverTimestamp(),
    };
    await updateDoc(clientRef, {
        interestedProperties: arrayUnion(interestedPropertyObject)
    });
}

/**
 * Removes a property from a client's list of interested properties.
 * Note: This query is more complex and might be better handled by fetching the doc,
 * modifying the array in code, and then updating the doc. This is a simplified version.
 */
export async function removeInterestedProperty(clientId: string, propertyId: string): Promise<void> {
    const clientRef = doc(clientsCollection, clientId);
    const clientProfile = await getClientProfile(clientId);
    if (clientProfile) {
        const updatedInterested = clientProfile.interestedProperties.filter(p => p.propertyId !== propertyId);
        await updateDoc(clientRef, {
            interestedProperties: updatedInterested
        });
    }
}


/**
 * Toggles a property in a client's favorites list and potentially creates a server-side relation.
 * @param clientId The ID of the client.
 * @param propertyInfo The core details of the property being favorited.
 * @returns {Promise<boolean>} True if the property is now a favorite, false otherwise.
 */
export async function toggleFavoriteProperty(
    clientId: string,
    propertyInfo: { propertyTenantId: string; propertyId: string; host?: string }
): Promise<boolean> {
    const clientProfile = await getClientProfile(clientId);
    if (!clientProfile) {
        throw new Error("Client profile not found.");
    }

    const isCurrentlyFavorite = clientProfile.interestedProperties.some(
        (p) => p.propertyId === propertyInfo.propertyId
    );

    if (isCurrentlyFavorite) {
        // Remove from favorites
        await removeInterestedProperty(clientId, propertyInfo.propertyId);
        // Note: We are not removing the server-side relation to keep a history.
        // This could be changed if required.
        return false;
    } else {
        // Add to favorites (client-side)
        await addInterestedProperty(clientId, propertyInfo);

        // Trigger server-side action to create a relation document
        // This runs with elevated privileges on the server.
        try {
            await createRelationForClientFavorite({
                propertyTenantId: propertyInfo.propertyTenantId,
                propertyId: propertyInfo.propertyId,
                clientId: clientId,
                consentSharedWithAgents: clientProfile.visibility?.shareWithAgents || false,
            });
        } catch (error) {
            console.error("Failed to create server-side relation:", error);
            // Even if the server-side action fails, the client-side favorite is already saved.
            // We might want to add more robust error handling here, like attempting a rollback.
        }
        return true;
    }
}
