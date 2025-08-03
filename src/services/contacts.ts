
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Contact } from '@/types';

const contactsCollection = collection(db, 'contacts');

// Type for new contact data, omitting id and date which will be generated
export type NewContactData = Omit<Contact, 'id' | 'date' | 'interestedPropertyIds'>;
export type UpdateContactData = Partial<Omit<Contact, 'id' | 'date'>>;


// Function to get all contacts from Firestore
export async function getContacts(): Promise<Contact[]> {
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


// Function to add a new contact to Firestore
export async function addContact(contactData: NewContactData): Promise<string> {
  const docRef = await addDoc(contactsCollection, {
    ...contactData,
    interestedPropertyIds: [], // Always initialize with an empty array
    date: serverTimestamp(),
  });
  return docRef.id;
}

// Function to update an existing contact in Firestore
export async function updateContact(id: string, contactData: UpdateContactData): Promise<void> {
    const contactDoc = doc(db, 'contacts', id);
    await updateDoc(contactDoc, contactData);
}

// Function to delete a contact from Firestore
export async function deleteContact(id: string): Promise<void> {
    const contactDoc = doc(db, 'contacts', id);
    await deleteDoc(contactDoc);
}
