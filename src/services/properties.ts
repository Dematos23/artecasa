import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, addDoc, updateDoc, deleteDoc, getDoc, where, documentId } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import type { Property, NewPropertyData, UpdatePropertyData } from '@/types';

// This service is now tenant-aware.
// All functions need a tenantId to interact with the correct sub-collection.

export const getPropertiesCollection = (tenantId: string) => {
    return collection(db, 'tenants', tenantId, 'properties');
};


// Function to get all properties from a tenant's collection
export async function getProperties(tenantId: string): Promise<Property[]> {
  const propertiesCollection = getPropertiesCollection(tenantId);
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

// Function to get a single property by ID from a tenant's collection
export async function getPropertyById(tenantId: string, id: string): Promise<Property | undefined> {
    const propertyDoc = doc(getPropertiesCollection(tenantId), id);
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

// Function to get multiple properties by their IDs within a tenant
export async function getPropertiesByIds(tenantId: string, ids: string[]): Promise<Property[]> {
  if (ids.length === 0) return [];
  const propertiesCollection = getPropertiesCollection(tenantId);
  const q = query(propertiesCollection, where(documentId(), 'in', ids));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
}


// Function to add a new property to a tenant's collection
export async function addProperty(tenantId: string, propertyData: NewPropertyData): Promise<string> {
  const docRef = await addDoc(getPropertiesCollection(tenantId), propertyData);
  return docRef.id;
}

// Function to update an existing property in a tenant's collection
export async function updateProperty(tenantId: string, id: string, propertyData: UpdatePropertyData): Promise<void> {
  const propertyDoc = doc(getPropertiesCollection(tenantId), id);
  await updateDoc(propertyDoc, propertyData);
}

// Function to delete a property from a tenant's collection and its images from Storage
export async function deleteProperty(tenantId: string, id: string, imageUrls: string[]): Promise<void> {
  // Delete images from Firebase Storage
  const deleteImagePromises = imageUrls.map(url => {
    try {
        const imageRef = ref(storage, url);
        return deleteObject(imageRef);
    } catch (error) {
        if ((error as any).code !== 'storage/object-not-found') {
            console.error("Error creating ref for image deletion: ", error);
        }
        return Promise.resolve();
    }
  });

  await Promise.all(deleteImagePromises).catch(error => {
      console.error("Error deleting one or more images from storage: ", error);
  });

  // Delete the document from Firestore
  const propertyDoc = doc(getPropertiesCollection(tenantId), id);
  await deleteDoc(propertyDoc);
}
