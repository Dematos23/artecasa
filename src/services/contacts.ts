import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc, updateDoc, getDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import type { Contact, Property, AssociationType } from '@/types';
import { getPropertiesByIds, updateProperty, getPropertyById } from './properties';
import { getProperties } from './properties';

// This service is now tenant-aware.
// All functions need a tenantId to interact with the correct sub-collection.

export const getContactsCollection = (tenantId: string) => {
  return collection(db, 'tenants', tenantId, 'contacts');
};

// Type for new contact data, omitting id and date which will be generated
export type NewContactData = Omit<Contact, 'id' | 'date' | 'interestedInPropertyIds' | 'ownerOfPropertyIds' | 'tenantOfPropertyId'>;
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

// Function to get the full name of a contact by ID from a tenant's collection
export async function getContactNameById(tenantId: string, id: string): Promise<string> {
    const contact = await getContactById(tenantId, id);
    if (!contact) return 'Desconocido';
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
}


// Function to get the properties (owned and interested) for a contact within a tenant
export async function getContactProperties(tenantId: string, contact: Contact): Promise<{ owned: Property[], interested: Property[], tenantOf?: Property }> {
    let owned: Property[] = [];
    let interested: Property[] = [];
    let tenantOf: Property | undefined = undefined;

    if (contact.ownerOfPropertyIds && contact.ownerOfPropertyIds.length > 0) {
        owned = await getPropertiesByIds(tenantId, contact.ownerOfPropertyIds);
    }
    if (contact.interestedInPropertyIds && contact.interestedInPropertyIds.length > 0) {
        interested = await getPropertiesByIds(tenantId, contact.interestedInPropertyIds);
    }
     if (contact.tenantOfPropertyId) {
        tenantOf = await getPropertyById(tenantId, contact.tenantOfPropertyId);
    }

    return { owned, interested, tenantOf };
}

// Function to get all properties that are not currently associated with any contact as an owner within a tenant
export async function getUnassociatedProperties(tenantId: string): Promise<Property[]> {
    const allProperties = await getProperties(tenantId);
    const allContacts = await getContacts(tenantId);
    const associatedPropertyIds = new Set(allContacts.flatMap(c => c.ownerOfPropertyIds || []));

    return allProperties.filter(p => !associatedPropertyIds.has(p.id));
}



// Function to add a new contact to a tenant's collection in Firestore
export async function addContact(tenantId: string, contactData: NewContactData): Promise<string> {
  const docRef = await addDoc(getContactsCollection(tenantId), {
    ...contactData,
    interestedInPropertyIds: [],
    ownerOfPropertyIds: [],
    tenantOfPropertyId: '',
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

// Function to associate a contact with a property within a tenant
export async function updateContactAssociations(
  tenantId: string,
  contactId: string, 
  propertyId: string, 
  associationType: 'interested' | 'owner' | 'inquilino'
): Promise<void> {
    const contactDoc = doc(getContactsCollection(tenantId), contactId);

    if (associationType === 'interested') {
        await updateDoc(contactDoc, {
            interestedInPropertyIds: arrayUnion(propertyId)
        });
    } else if (associationType === 'inquilino') {
        await updateDoc(contactDoc, {
            tenantOfPropertyId: propertyId,
            types: arrayUnion('arrendatario')
        });
    } else if (associationType === 'owner') {
        await updateDoc(contactDoc, {
            ownerOfPropertyIds: arrayUnion(propertyId)
        });
        await updateProperty(tenantId, propertyId, { ownerId: contactId });
    }
}

// Function to disassociate a property from a contact within a tenant
export async function disassociatePropertyFromContact(tenantId: string, contactId: string, propertyId: string): Promise<void> {
    const contactDocRef = doc(getContactsCollection(tenantId), contactId);
    const contactSnap = await getDoc(contactDocRef);
    const contact = contactSnap.data() as Contact | undefined;

    const updates: any = {
        interestedInPropertyIds: arrayRemove(propertyId),
        ownerOfPropertyIds: arrayRemove(propertyId)
    };

    if (contact?.tenantOfPropertyId === propertyId) {
        updates.tenantOfPropertyId = "";
    }
    
    await updateDoc(contactDocRef, updates);

    const propertySnap = await getPropertyById(tenantId, propertyId);
    if(propertySnap?.ownerId === contactId) {
      await updateProperty(tenantId, propertyId, { ownerId: '' });
    }
}

// Function to change the association type of a property for a contact within a tenant
export async function updateContactAssociationType(
    tenantId: string,
    contactId: string,
    propertyId: string,
    newType: AssociationType
): Promise<void> {
    const batch = writeBatch(db);
    const contactRef = doc(getContactsCollection(tenantId), contactId);

    const removalUpdates: any = {
        ownerOfPropertyIds: arrayRemove(propertyId),
        interestedInPropertyIds: arrayRemove(propertyId),
    };
    batch.update(contactRef, removalUpdates);

    const contactSnap = await getDoc(contactRef);
    if (contactSnap.exists() && contactSnap.data().tenantOfPropertyId === propertyId) {
        batch.update(contactRef, { tenantOfPropertyId: '' });
    }

    if (newType === 'owner') {
        batch.update(contactRef, { ownerOfPropertyIds: arrayUnion(propertyId) });
        const propertyRef = doc(db, 'tenants', tenantId, 'properties', propertyId);
        batch.update(propertyRef, { ownerId: contactId });
    } else if (newType === 'interested') {
        batch.update(contactRef, { interestedInPropertyIds: arrayUnion(propertyId) });
        const propertySnap = await getPropertyById(tenantId, propertyId);
        if(propertySnap?.ownerId === contactId) {
            const propertyRef = doc(db, 'tenants', tenantId, 'properties', propertyId);
            batch.update(propertyRef, { ownerId: '' });
        }
    } else if (newType === 'inquilino') {
        batch.update(contactRef, {
            tenantOfPropertyId: propertyId,
            types: arrayUnion('arrendatario')
        });
        const propertySnap = await getPropertyById(tenantId, propertyId);
        if(propertySnap?.ownerId === contactId) {
            const propertyRef = doc(db, 'tenants', tenantId, 'properties', propertyId);
            batch.update(propertyRef, { ownerId: '' });
        }
    }

    await batch.commit();
}
