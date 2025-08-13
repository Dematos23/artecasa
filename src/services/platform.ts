import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import {
  type PlatformUser,
  platformUserConverter,
  type PlatformSettings,
  platformSettingsConverter,
} from '@/types/multitenant';

// =================================================================================
// Platform Users Repository
// =================================================================================

const platformUsersCollection = collection(db, 'platformUsers').withConverter(
  platformUserConverter
);

export const platformUsersRepo = {
  get: async (id: string): Promise<PlatformUser | null> => {
    const docSnap = await getDoc(doc(platformUsersCollection, id));
    return docSnap.exists() ? docSnap.data() : null;
  },
  list: async (): Promise<PlatformUser[]> => {
    const snapshot = await getDocs(platformUsersCollection);
    return snapshot.docs.map((doc) => doc.data());
  },
  findByEmail: async (email: string): Promise<PlatformUser | null> => {
    const q = query(platformUsersCollection, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data();
  },
};

// =================================================================================
// Platform Settings Repository
// =================================================================================

const platformSettingsCollection = collection(
  db,
  'platformSettings'
).withConverter(platformSettingsConverter);

export const platformSettingsRepo = {
  get: async (): Promise<PlatformSettings | null> => {
    // Platform settings are often a singleton document.
    const settingsDoc = doc(platformSettingsCollection, 'default');
    const docSnap = await getDoc(settingsDoc);
    return docSnap.exists() ? docSnap.data() : null;
  },
};
