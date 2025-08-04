
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import type { Lead } from '@/types';
import { addContact } from './contacts';

const leadsCollection = collection(db, 'leads');

// Type for new lead data, omitting id and date which will be generated
export type NewLeadData = Omit<Lead, 'id' | 'date'>;

// Function to get all leads from Firestore
export async function getLeads(): Promise<Lead[]> {
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

// Function to add a new lead to Firestore
export async function addLead(leadData: NewLeadData): Promise<string> {
  const docRef = await addDoc(leadsCollection, {
    ...leadData,
    date: serverTimestamp(),
  });
  return docRef.id;
}

// Function to delete a lead from Firestore
export async function deleteLead(id: string): Promise<void> {
    const leadDoc = doc(db, 'leads', id);
    await deleteDoc(leadDoc);
}


// Function to convert a lead to a contact
export async function convertLeadToContact(lead: Lead): Promise<string> {
    const nameParts = lead.name.split(' ');
    const firstname = nameParts[0] || '';
    const firstlastname = nameParts.slice(1).join(' ') || '';

    const newContactId = await addContact({
        firstname,
        firstlastname,
        email: lead.email,
        phone: lead.phone,
        notes: lead.message,
        types: ['comprador', 'arrendatario'], // Default types
    });

    // After successful conversion, delete the lead
    await deleteLead(lead.id);
    
    return newContactId;
}
