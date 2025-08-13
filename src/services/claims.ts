import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Claim } from '@/types';

// This file is now tenant-aware.
// Functions will need a tenantId to know which sub-collection to query.

export const getClaimsCollection = (tenantId: string) => {
  return collection(db, 'tenants', tenantId, 'claims');
};

// Function to get the last correlative number for a specific tenant
async function getLastCorrelative(tenantId: string): Promise<number> {
    const claimsCollection = getClaimsCollection(tenantId);
    const q = query(claimsCollection, orderBy('correlative', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return 0; // No claims yet, start from 1
    }

    const lastClaim = querySnapshot.docs[0].data() as Claim;
    const lastCorrelativeParts = lastClaim.correlative.split('-');
    return parseInt(lastCorrelativeParts[1], 10);
}

// Function to generate the next correlative ID string for a specific tenant
async function generateCorrelative(tenantId: string): Promise<string> {
    const lastNumber = await getLastCorrelative(tenantId);
    const nextNumber = lastNumber + 1;
    const year = new Date().getFullYear();
    // Format: 000001-YEAR
    return `${String(nextNumber).padStart(6, '0')}-${year}`;
}


// Function to add a new claim to a specific tenant's collection in Firestore
export async function addClaim(tenantId: string, claimData: Omit<Claim, 'id' | 'correlative' | 'createdAt'>): Promise<string> {
  const correlative = await generateCorrelative(tenantId);
  const claimsCollection = getClaimsCollection(tenantId);
  
  const docRef = await addDoc(claimsCollection, {
    ...claimData,
    correlative,
    createdAt: serverTimestamp(),
  });

  // Return the correlative ID, which is more useful for the user
  return correlative;
}
