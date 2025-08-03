
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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

// Function to add a new property to Firestore
export async function addProperty(propertyData: NewPropertyData): Promise<string> {
  const docRef = await addDoc(propertiesCollection, {
    ...propertyData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Function to update an existing property in Firestore
export async function updateProperty(id: string, propertyData: UpdatePropertyData): Promise<void> {
  const propertyDoc = doc(db, 'properties', id);
  await updateDoc(propertyDoc, {
    ...propertyData,
    updatedAt: serverTimestamp(),
  });
}

// Function to delete a property from Firestore and its images from Storage
export async function deleteProperty(id: string, imageUrls: string[]): Promise<void> {
  // Delete images from Firebase Storage
  const deleteImagePromises = imageUrls.map(url => {
    const imageRef = ref(storage, url);
    return deleteObject(imageRef).catch(error => {
      // It's okay if the image doesn't exist, log other errors
      if (error.code !== 'storage/object-not-found') {
        console.error("Error deleting image from storage: ", error);
      }
    });
  });

  await Promise.all(deleteImagePromises);

  // Delete the document from Firestore
  const propertyDoc = doc(db, 'properties', id);
  await deleteDoc(propertyDoc);
}
