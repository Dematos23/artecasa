
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
  if (!tenantId) {
      console.error("getLeads called without tenantId");
      return [];
  }
  const leadsCollection = getLeadsCollection(tenantId);
  const q = query(leadsCollection, orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to JS Date for consistency
      date: data.date?.toDate ? data.date.toDate() : new Date(),
    } as Lead;
  });
}

// Function to add a new lead to a tenant's collection
export async function addLead(tenantId: string, leadData: NewLeadData): Promise<string> {
  if (!tenantId) throw new Error("tenantId is required to add a lead.");
  const docRef = await addDoc(getLeadsCollection(tenantId), {
    ...leadData,
    date: serverTimestamp(),
  });
  return docRef.id;
}

// Function to delete a lead from a tenant's collection
export async function deleteLead(tenantId: string, id: string): Promise<void> {
    if (!tenantId) throw new Error("tenantId is required to delete a lead.");
    const leadDoc = doc(getLeadsCollection(tenantId), id);
    await deleteDoc(leadDoc);
}


// Function to convert a lead to a contact within a tenant
export async function convertLeadToContact(tenantId: string, lead: Lead): Promise<string> {
    if (!tenantId) throw new Error("tenantId is required to convert a lead.");
    
    const nameParts = lead.name.split(' ');
    const firstname = nameParts[0] || '';
    // This is a simple split, might not be perfect for all name formats
    const firstlastname = nameParts.slice(1).join(' ') || '';

    const newContactId = await addContact(tenantId, {
        firstname,
        firstlastname,
        email: lead.email,
        phone: lead.phone,
        notes: `Lead original: "${lead.message}"`, // Add original message to notes
        types: ['comprador'], // Default to a common type
    });

    // After successful conversion, delete the lead
    await deleteLead(tenantId, lead.id);
    
    return newContactId;
}
