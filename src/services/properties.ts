
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Property } from '@/types';

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
