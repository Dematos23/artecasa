
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Contact, Property } from '@/types';
import { getPropertiesByIds, updateProperty } from './properties';
import { getProperties } from './properties';


const contactsCollection = collection(db, 'contacts');

// Type for new contact data, omitting id and date which will be generated
export type NewContactData = Omit<Contact, 'id' | 'date' | 'interestedInPropertyIds' | 'ownerOfPropertyIds'>;
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

// Function to get a single contact by ID
export async function getContactById(id: string): Promise<Contact | undefined> {
    const contactDoc = doc(db, 'contacts', id);
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

// Function to get the properties (owned and interested) for a contact
export async function getContactProperties(contact: Contact): Promise<{ owned: Property[], interested: Property[] }> {
    let owned: Property[] = [];
    let interested: Property[] = [];

    if (contact.ownerOfPropertyIds && contact.ownerOfPropertyIds.length > 0) {
        owned = await getPropertiesByIds(contact.ownerOfPropertyIds);
    }
    if (contact.interestedInPropertyIds && contact.interestedInPropertyIds.length > 0) {
        interested = await getPropertiesByIds(contact.interestedInPropertyIds);
    }

    return { owned, interested };
}

// Function to get all properties that are not currently associated with any contact as an owner
export async function getUnassociatedProperties(): Promise<Property[]> {
    const allProperties = await getProperties();
    const allContacts = await getContacts();
    const associatedPropertyIds = new Set(allContacts.flatMap(c => c.ownerOfPropertyIds || []));

    return allProperties.filter(p => !associatedPropertyIds.has(p.id));
}



// Function to add a new contact to Firestore
export async function addContact(contactData: NewContactData): Promise<string> {
  const docRef = await addDoc(contactsCollection, {
    ...contactData,
    interestedInPropertyIds: contactData.interestedInPropertyIds || [],
    ownerOfPropertyIds: contactData.ownerOfPropertyIds || [],
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

// Function to associate a contact with a property
export async function updateContactAssociations(
  contactId: string, 
  propertyId: string, 
  associationType: 'interested' | 'owner'
): Promise<void> {
    const contactDoc = doc(db, 'contacts', contactId);

    if (associationType === 'interested') {
        await updateDoc(contactDoc, {
            interestedInPropertyIds: arrayUnion(propertyId)
        });
    } else if (associationType === 'owner') {
        await updateDoc(contactDoc, {
            ownerOfPropertyIds: arrayUnion(propertyId)
        });
        // Also update the property to set the ownerId
        await updateProperty(propertyId, { ownerId: contactId });
    }
}

// Function to disassociate a property from a contact
export async function disassociatePropertyFromContact(contactId: string, propertyId: string): Promise<void> {
    const contactDoc = doc(db, 'contacts', contactId);
    
    // Remove from both arrays, as we don't know the type here.
    // Firestore's arrayRemove is idempotent.
    await updateDoc(contactDoc, {
        interestedInPropertyIds: arrayRemove(propertyId),
        ownerOfPropertyIds: arrayRemove(propertyId)
    });

    // Unset the ownerId from the property as well
    await updateProperty(propertyId, { ownerId: '' }); // or delete the field
}
