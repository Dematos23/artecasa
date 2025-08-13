import { db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp } from 'firebase/firestore';
import { clientProfileConverter, type ClientProfile, type InterestedProperty } from '@/types/multitenant';
import type { User } from 'firebase/auth';

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
