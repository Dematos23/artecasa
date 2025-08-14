

import { db, storage } from '@/lib/firebase';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDoc, 
    where, 
    documentId,
    startAfter,
    limit,
    QueryConstraint,
    collectionGroup
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import type { Property, NewPropertyData, UpdatePropertyData } from '@/types';
import { makeCursor, parseCursor } from './pagination';

// This service is tenant-aware for CLIENT-SIDE operations.
// All functions need a tenantId to interact with the correct sub-collection.

export const getPropertiesCollection = (tenantId: string) => {
    return collection(db, 'tenants', tenantId, 'properties');
};

/**
 * Lists published properties for a specific tenant.
 * This is intended for the public-facing tenant websites.
 */
export async function listProperties(
    { tenantId, filters = {}, cursor, pageSize = 24 }: {
        tenantId: string;
        filters?: {
            modality?: 'venta' | 'alquiler' | 'all';
            propertyType?: string | 'all';
            bedrooms?: number | 'all';
            minPrice?: number;
            maxPrice?: number;
            currency?: 'USD' | 'PEN';
        };
        cursor?: string;
        pageSize?: number;
    }
): Promise<{ properties: Property[]; nextCursor: string | null }> {
    
    const propertiesCollection = getPropertiesCollection(tenantId);
    
    const constraints: QueryConstraint[] = [
        where('featured', '==', true) // Always filter by published status for public lists
    ];

    if (filters.modality && filters.modality !== 'all') {
        constraints.push(where('modality', '==', filters.modality));
    }
    if (filters.propertyType && filters.propertyType !== 'all') {
        constraints.push(where('propertyType', '==', filters.propertyType));
    }
    if (filters.bedrooms && filters.bedrooms !== 'all') {
        constraints.push(where('bedrooms', '>=', filters.bedrooms));
    }

    const priceField = filters.currency === 'PEN' ? 'pricePEN' : 'priceUSD';
    if (filters.minPrice) {
        constraints.push(where(priceField, '>=', filters.minPrice));
    }
    if (filters.maxPrice) {
        constraints.push(where(priceField, '<=', filters.maxPrice));
    }

    // Default order. Use a consistent field for reliable pagination.
    constraints.push(orderBy(priceField, 'desc'));
    constraints.push(limit(pageSize));

    const parsedCursor = parseCursor(cursor);
    if (parsedCursor) {
        constraints.push(startAfter(parsedCursor));
    }
    
    const q = query(propertiesCollection, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const properties = querySnapshot.docs.map(doc => {
      const data = doc.data() as Property;
      return { 
        id: doc.id, 
        ...data,
        tenantId: tenantId,
      } as Property
    });
    
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? makeCursor(lastDoc) : null;

    return { properties, nextCursor };
}


// Function to get all properties from a tenant's collection (for internal admin use)
export async function getProperties(tenantId: string): Promise<Property[]> {
  const propertiesCollection = getPropertiesCollection(tenantId);
  const q = query(propertiesCollection, orderBy('title', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      tenantId: tenantId, // Add tenantId to the property object
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
