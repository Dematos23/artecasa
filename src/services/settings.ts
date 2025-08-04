
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Settings } from '@/types';


const settingsDocRef = doc(db, 'settings', 'global');

export async function saveSettings(settings: Settings): Promise<void> {
  await setDoc(settingsDocRef, { 
    ...settings,
    updatedAt: serverTimestamp() 
  }, { merge: true });
}

export async function getSettings(): Promise<Settings | null> {
  const docSnap = await getDoc(settingsDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as Settings;
  }
  return null;
}
