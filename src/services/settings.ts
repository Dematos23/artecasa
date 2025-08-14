import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Settings } from '@/types';

// This file is now tenant-aware.
// It will fetch settings from a tenant's sub-collection or return portal defaults.

export async function getSettings(tenantId?: string | null): Promise<Settings | null> {
  if (!tenantId) {
    // This is the root portal, return hardcoded global defaults.
    // In a more complex app, this could come from a 'platformSettings' collection.
    return {
      logoUrl: '/logo.png',
      whatsappNumber: '51987654321', // Example number for the portal
      homepageTitle: 'Casora - Inmobiliaria de Lujo',
      homepageSubtitle: 'Encuentra la propiedad de tus sueños.',
      homepageHeroButtonText: 'Explorar Propiedades',
      primaryColor: '45 53% 51%',
      backgroundColor: '0 0% 100%',
      accentColor: '240 10% 3.9%',
      bodyFont: 'Montserrat',
      headlineFont: 'Montserrat',
    };
  }
  
  // This is a tenant-specific request.
  const settingsDocRef = doc(db, 'tenants', tenantId, 'settings', 'default');
  const docSnap = await getDoc(settingsDocRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null;
    return { ...data, updatedAt } as Settings;
  }
  return null; // Tenant exists but has no settings configured
}


export async function saveSettings(tenantId: string, settings: Omit<Settings, 'updatedAt'>) {
    const settingsDocRef = doc(db, 'tenants', tenantId, 'settings', 'default');
    await setDoc(settingsDocRef, {
        ...settings,
        updatedAt: serverTimestamp()
    }, { merge: true });
}
