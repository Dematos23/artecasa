
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Settings } from '@/types';

const settingsDocRef = doc(db, 'settings', 'global');

export async function saveSettings(settings: Omit<Settings, 'updatedAt'>): Promise<void> {
  await setDoc(settingsDocRef, { 
    ...settings,
    updatedAt: serverTimestamp() 
  }, { merge: true });
}

export async function getSettings(): Promise<Settings | null> {
  const docSnap = await getDoc(settingsDocRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    // Convert Firestore Timestamp to ISO string if it's a Timestamp object
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null;
    return { ...data, updatedAt } as Settings;
  }
  return null;
}
