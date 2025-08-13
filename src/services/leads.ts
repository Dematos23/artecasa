import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import type { Lead } from '@/types';
import { addContact } from './contacts';

// This service is now tenant-aware.
// All functions need a tenantId to interact with the correct sub-collection.

export const getLeadsCollection = (tenantId: string) => {
    return collection(db, 'tenants', tenantId, 'leads');
};

// Type for new lead data, omitting id and date which will be generated
export type NewLeadData = Omit<Lead, 'id' | 'date'>;

// Function to get all leads from a tenant's collection
export async function getLeads(tenantId: string): Promise<Lead[]> {
  const leadsCollection = getLeadsCollection(tenantId);
  const q = query(leadsCollection, orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(),
    } as Lead;
  });
}

// Function to add a new lead to a tenant's collection
export async function addLead(tenantId: string, leadData: NewLeadData): Promise<string> {
  const docRef = await addDoc(getLeadsCollection(tenantId), {
    ...leadData,
    date: serverTimestamp(),
  });
  return docRef.id;
}

// Function to delete a lead from a tenant's collection
export async function deleteLead(tenantId: string, id: string): Promise<void> {
    const leadDoc = doc(getLeadsCollection(tenantId), id);
    await deleteDoc(leadDoc);
}


// Function to convert a lead to a contact within a tenant
export async function convertLeadToContact(tenantId: string, lead: Lead): Promise<string> {
    const nameParts = lead.name.split(' ');
    const firstname = nameParts[0] || '';
    const firstlastname = nameParts.slice(1).join(' ') || '';

    const newContactId = await addContact(tenantId, {
        firstname,
        firstlastname,
        email: lead.email,
        phone: lead.phone,
        notes: lead.message,
        types: ['comprador', 'arrendatario'], // Default types
    });

    // After successful conversion, delete the lead
    await deleteLead(tenantId, lead.id);
    
    return newContactId;
}
