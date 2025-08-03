
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, addDoc, updateDoc, deleteDoc, getDoc, where, documentId } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import type { Property, NewPropertyData, UpdatePropertyData } from '@/types';

const propertiesCollection = collection(db, 'properties');

// Function to get all properties from Firestore
export async function getProperties(): Promise<Property[]> {
  const q = query(propertiesCollection, orderBy('title', 'asc')); // Example order
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    } as Property;
  });
}

// Function to get a single property by ID
export async function getPropertyById(id: string): Promise<Property | undefined> {
    const propertyDoc = doc(db, 'properties', id);
    const docSnap = await getDoc(propertyDoc);

    if (docSnap.exists()) {
        return {
            id: docSnap.id,
            ...docSnap.data(),
        } as Property;
    } else {
        return undefined;
    }
}

// Function to get properties where the ownerId matches a contactId
export async function getPropertiesByOwnerId(ownerId: string): Promise<Property[]> {
  const q = query(propertiesCollection, where('ownerId', '==', ownerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
}

// Function to get multiple properties by their IDs
export async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  if (ids.length === 0) return [];
  const q = query(propertiesCollection, where(documentId(), 'in', ids));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
}


// Function to add a new property to Firestore
export async function addProperty(propertyData: NewPropertyData): Promise<string> {
  const docRef = await addDoc(propertiesCollection, {
    ...propertyData,
  });
  return docRef.id;
}

// Function to update an existing property in Firestore
export async function updateProperty(id: string, propertyData: UpdatePropertyData): Promise<void> {
  const propertyDoc = doc(db, 'properties', id);
  await updateDoc(propertyDoc, {
    ...propertyData,
  });
}

// Function to delete a property from Firestore and its images from Storage
export async function deleteProperty(id: string, imageUrls: string[]): Promise<void> {
  // Delete images from Firebase Storage
  const deleteImagePromises = imageUrls.map(url => {
    try {
        const imageRef = ref(storage, url);
        return deleteObject(imageRef);
    } catch (error) {
        // It's okay if the image doesn't exist, log other errors
        if ((error as any).code !== 'storage/object-not-found') {
            console.error("Error creating ref for image deletion: ", error);
        }
        return Promise.resolve(); // Continue even if one ref fails
    }
  });

  await Promise.all(deleteImagePromises).catch(error => {
      console.error("Error deleting one or more images from storage: ", error);
  });

  // Delete the document from Firestore
  const propertyDoc = doc(db, 'properties', id);
  await deleteDoc(propertyDoc);
}
