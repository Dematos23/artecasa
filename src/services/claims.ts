
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Claim } from '@/types';

const claimsCollection = collection(db, 'claims');

// Function to get the last correlative number
async function getLastCorrelative(): Promise<number> {
    const q = query(claimsCollection, orderBy('correlative', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return 0; // No claims yet, start from 1
    }

    const lastClaim = querySnapshot.docs[0].data() as Claim;
    const lastCorrelativeParts = lastClaim.correlative.split('-');
    return parseInt(lastCorrelativeParts[1], 10);
}

// Function to generate the next correlative ID string
async function generateCorrelative(): Promise<string> {
    const lastNumber = await getLastCorrelative();
    const nextNumber = lastNumber + 1;
    const year = new Date().getFullYear();
    // Format: 000001-YEAR
    return `${String(nextNumber).padStart(6, '0')}-${year}`;
}


// Function to add a new claim to Firestore
export async function addClaim(claimData: Omit<Claim, 'id' | 'correlative' | 'createdAt'>): Promise<string> {
  const correlative = await generateCorrelative();
  
  const docRef = await addDoc(claimsCollection, {
    ...claimData,
    correlative,
    createdAt: serverTimestamp(),
  });

  // Return the correlative ID, which is more useful for the user
  return correlative;
}
