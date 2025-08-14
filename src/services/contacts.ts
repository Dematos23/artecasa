
import { db } from '@/lib/firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    doc, 
    deleteDoc, 
    updateDoc, 
    getDoc,
    getDocsFromCache,
    writeBatch
} from 'firebase/firestore';
import type { Contact, Property, AssociationType } from '@/types';
import { getPropertiesByIds } from './properties';

// This service is now tenant-aware.
// All functions need a tenantId to interact with the correct sub-collection.

export const getContactsCollection = (tenantId: string) => {
  return collection(db, 'tenants', tenantId, 'contacts');
};

// Type for new contact data, omitting id and date which will be generated
export type NewContactData = Omit<Contact, 'id' | 'date' | 'ownerOfPropertyIds' | 'interestedInPropertyIds' | 'tenantOfPropertyId'>;
export type UpdateContactData = Partial<Omit<Contact, 'id' | 'date'>>;


// Function to get all contacts from a tenant's collection
export async function getContacts(tenantId: string): Promise<Contact[]> {
  if (!tenantId) {
      console.error("getContacts called without tenantId");
      return [];
  }
  const contactsCollection = getContactsCollection(tenantId);
  const q = query(contactsCollection, orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
    } as Contact;
  });
}

// Function to get a single contact by ID from a tenant's collection
export async function getContactById(tenantId: string, id: string): Promise<Contact | undefined> {
    if (!tenantId) return undefined;
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

// Function to get a contact's name by ID (optimized for display)
export async function getContactNameById(tenantId: string, id: string): Promise<string> {
    if (!tenantId) return "Desconocido";
    const contact = await getContactById(tenantId, id);
    if (!contact) return "Desconocido";
    return [contact.firstname, contact.firstlastname].filter(Boolean).join(' ');
}


// Function to add a new contact to a tenant's collection in Firestore
export async function addContact(tenantId: string, contactData: NewContactData): Promise<string> {
  if (!tenantId) throw new Error("tenantId is required to add a contact.");
  const docRef = await addDoc(getContactsCollection(tenantId), {
    ...contactData,
    ownerOfPropertyIds: [],
    interestedInPropertyIds: [],
    tenantOfPropertyId: null,
    date: serverTimestamp(),
  });
  return docRef.id;
}

// Function to update an existing contact in a tenant's collection
export async function updateContact(tenantId: string, id: string, contactData: UpdateContactData): Promise<void> {
    if (!tenantId) throw new Error("tenantId is required to update a contact.");
    const contactDoc = doc(getContactsCollection(tenantId), id);
    await updateDoc(contactDoc, contactData);
}

// Function to delete a contact from a tenant's collection
export async function deleteContact(tenantId: string, id: string): Promise<void> {
    if (!tenantId) throw new Error("tenantId is required to delete a contact.");
    const contactDoc = doc(getContactsCollection(tenantId), id);
    await deleteDoc(contactDoc);
}


// Function to get properties related to a contact
export async function getContactProperties(tenantId: string, contact: Contact): Promise<{ owned: Property[], interested: Property[], tenantOf?: Property }> {
  if (!tenantId) throw new Error("tenantId is required.");
  
  const owned = contact.ownerOfPropertyIds?.length ? await getPropertiesByIds(tenantId, contact.ownerOfPropertyIds) : [];
  const interested = contact.interestedInPropertyIds?.length ? await getPropertiesByIds(tenantId, contact.interestedInPropertyIds) : [];
  let tenantOf: Property | undefined = undefined;
  if (contact.tenantOfPropertyId) {
    const prop = await getPropertiesByIds(tenantId, [contact.tenantOfPropertyId]);
    tenantOf = prop[0];
  }
  
  return { owned, interested, tenantOf };
}

// Function to get all properties *not* associated with any contact
export async function getUnassociatedProperties(tenantId: string): Promise<Property[]> {
  if (!tenantId) return [];

  // 1. Get all contacts and collect all associated property IDs
  const contactsSnapshot = await getDocsFromCache(getContactsCollection(tenantId));
  const allAssociatedIds = new Set<string>();
  contactsSnapshot.forEach(docSnap => {
      const contact = docSnap.data() as Contact;
      contact.ownerOfPropertyIds?.forEach(id => allAssociatedIds.add(id));
      contact.interestedInPropertyIds?.forEach(id => allAssociatedIds.add(id));
      if (contact.tenantOfPropertyId) {
          allAssociatedIds.add(contact.tenantOfPropertyId);
      }
  });
  
  // 2. Get all properties
  const allProperties = await getProperties(tenantId);
  
  // 3. Filter out the associated ones
  return allProperties.filter(prop => !allAssociatedIds.has(prop.id));
}

// Function to associate a property with a contact
export async function updateContactAssociations(tenantId: string, contactId: string, propertyId: string, associationType: AssociationType): Promise<void> {
  if (!tenantId) throw new Error("tenantId is required.");

  const contactRef = doc(getContactsCollection(tenantId), contactId);
  const contactSnap = await getDoc(contactRef);
  if (!contactSnap.exists()) throw new Error("Contact not found");

  const contact = contactSnap.data() as Contact;

  // Create new arrays, removing the propertyId from all lists first
  const newOwnerOf = (contact.ownerOfPropertyIds || []).filter(id => id !== propertyId);
  const newInterestedIn = (contact.interestedInPropertyIds || []).filter(id => id !== propertyId);
  let newTenantOf = contact.tenantOfPropertyId === propertyId ? null : contact.tenantOfPropertyId;

  // Add the propertyId to the correct new list
  if (associationType === 'owner') {
    newOwnerOf.push(propertyId);
  } else if (associationType === 'interested') {
    newInterestedIn.push(propertyId);
  } else if (associationType === 'inquilino') {
    newTenantOf = propertyId;
  }
  
  await updateDoc(contactRef, {
    ownerOfPropertyIds: newOwnerOf,
    interestedInPropertyIds: newInterestedIn,
    tenantOfPropertyId: newTenantOf
  });
}

// Function to disassociate a property from a contact
export async function disassociatePropertyFromContact(tenantId: string, contactId: string, propertyId: string): Promise<void> {
    if (!tenantId) throw new Error("tenantId is required.");
    const contactRef = doc(getContactsCollection(tenantId), contactId);
    const contactSnap = await getDoc(contactRef);
    if (!contactSnap.exists()) throw new Error("Contact not found");

    const contact = contactSnap.data() as Contact;
    
    await updateDoc(contactRef, {
      ownerOfPropertyIds: (contact.ownerOfPropertyIds || []).filter(id => id !== propertyId),
      interestedInPropertyIds: (contact.interestedInPropertyIds || []).filter(id => id !== propertyId),
      tenantOfPropertyId: contact.tenantOfPropertyId === propertyId ? null : contact.tenantOfPropertyId,
    });
}

// Function to update the association type of an already-linked property
export async function updateContactAssociationType(tenantId: string, contactId: string, propertyId: string, newType: AssociationType): Promise<void> {
    if (!tenantId) throw new Error("tenantId is required.");
    // This reuses the logic from the main update function.
    await updateContactAssociations(tenantId, contactId, propertyId, newType);
}
