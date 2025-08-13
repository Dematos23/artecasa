import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import type { Contact } from '@/types';

// This service is now tenant-aware.
// All functions need a tenantId to interact with the correct sub-collection.

export const getContactsCollection = (tenantId: string) => {
  return collection(db, 'tenants', tenantId, 'contacts');
};

// Type for new contact data, omitting id and date which will be generated
export type NewContactData = Omit<Contact, 'id' | 'date'>;
export type UpdateContactData = Partial<Omit<Contact, 'id' | 'date'>>;


// Function to get all contacts from a tenant's collection
export async function getContacts(tenantId: string): Promise<Contact[]> {
  const contactsCollection = getContactsCollection(tenantId);
  const q = query(contactsCollection, orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to ISO string if it's a Timestamp object
      date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
    } as Contact;
  });
}

// Function to get a single contact by ID from a tenant's collection
export async function getContactById(tenantId: string, id: string): Promise<Contact | undefined> {
    const contactDoc = doc(getContactsCollection(tenantId), id);
    const docSnap = await getDoc(contactDoc);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
        } as Contact;
    } else {
        return undefined;
    }
}

// Function to add a new contact to a tenant's collection in Firestore
export async function addContact(tenantId: string, contactData: NewContactData): Promise<string> {
  const docRef = await addDoc(getContactsCollection(tenantId), {
    ...contactData,
    date: serverTimestamp(),
  });
  return docRef.id;
}

// Function to update an existing contact in a tenant's collection
export async function updateContact(tenantId: string, id: string, contactData: UpdateContactData): Promise<void> {
    const contactDoc = doc(getContactsCollection(tenantId), id);
    await updateDoc(contactDoc, contactData);
}

// Function to delete a contact from a tenant's collection
export async function deleteContact(tenantId: string, id: string): Promise<void> {
    const contactDoc = doc(getContactsCollection(tenantId), id);
    await deleteDoc(contactDoc);
}
