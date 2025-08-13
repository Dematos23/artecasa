import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { type TenantSettings } from '@/types/multitenant';

// This file is now tenant-aware.
// It will fetch settings from a tenant's sub-collection.

export async function getSettings(tenantId: string): Promise<TenantSettings | null> {
  const settingsDocRef = doc(db, 'tenants', tenantId, 'settings', 'default');
  const docSnap = await getDoc(settingsDocRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null;
    return { ...data, updatedAt } as TenantSettings;
  }
  return null;
}


export async function saveSettings(tenantId: string, settings: Omit<TenantSettings, 'updatedAt'>) {
    const settingsDocRef = doc(db, 'tenants', tenantId, 'settings', 'default');
    await setDoc(settingsDocRef, {
        ...settings,
        updatedAt: serverTimestamp()
    }, { merge: true });
}
