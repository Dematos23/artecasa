import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  type CollectionReference,
  type DocumentData,
} from 'firebase/firestore';
import {
  type Tenant,
  tenantConverter,
  type TenantUser,
  tenantUserConverter,
  type Domain,
  domainConverter,
  type TenantSettings,
} from '@/types/multitenant';
import type { Property, Contact, Lead, Claim } from '@/types';

// =================================================================================
// Helper to get a typed collection reference for a tenant
// =================================================================================

export function getTenantCollection<T = DocumentData>(
  tenantId: string,
  collectionName: string
): CollectionReference<T> {
  return collection(db, 'tenants', tenantId, collectionName) as CollectionReference<T>;
}

// =================================================================================
// Tenant Repositories
// =================================================================================

// This function returns an object containing all repositories for a given tenant.
// This is a common pattern to ensure all data access is scoped to the tenant.

export function getTenantRepositories(tenantId: string) {
  const properties = getTenantCollection<Property>(tenantId, 'properties');
  const contacts = getTenantCollection<Contact>(tenantId, 'contacts');
  const leads = getTenantCollection<Lead>(tenantId, 'leads');
  const users = getTenantCollection<TenantUser>(tenantId, 'users').withConverter(tenantUserConverter);
  const domains = getTenantCollection<Domain>(tenantId, 'domains').withConverter(domainConverter);
  const settings = getTenantCollection<TenantSettings>(tenantId, 'settings');

  return {
    properties,
    contacts,
    leads,
    users: {
      get: async (id: string): Promise<TenantUser | null> => {
        const docSnap = await getDoc(doc(users, id));
        return docSnap.exists() ? docSnap.data() : null;
      }
    },
    domains,
    settings: {
      get: async (): Promise<TenantSettings | null> => {
        const settingsDoc = doc(settings, 'default');
        const docSnap = await getDoc(settingsDoc);
        return docSnap.exists() ? docSnap.data() : null;
      }
    },
  };
}

// =================================================================================
// Root Tenant Repository
// =================================================================================

const tenantsCollection = collection(db, 'tenants').withConverter(tenantConverter);

export const tenantsRepo = {
  get: async (id: string): Promise<Tenant | null> => {
    const docSnap = await getDoc(doc(tenantsCollection, id));
    return docSnap.exists() ? docSnap.data() : null;
  },
};
