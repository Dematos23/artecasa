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
  type Agent,
  agentConverter,
  type Domain,
  domainConverter,
  type Relation,
  relationConverter,
  type Share,
  shareConverter,
} from '@/types/multitenant';
import type { Property, Contact, Lead, Claim, Settings } from '@/types';

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
  const agents = getTenantCollection<Agent>(tenantId, 'agents').withConverter(agentConverter);
  const domains = getTenantCollection<Domain>(tenantId, 'domains').withConverter(domainConverter);
  const settings = getTenantCollection<Settings>(tenantId, 'settings');
  const relations = getTenantCollection<Relation>(tenantId, 'relations').withConverter(relationConverter);
  const shares = getTenantCollection<Share>(tenantId, 'shares').withConverter(shareConverter);

  return {
    properties,
    contacts,
    leads,
    agents,
    domains,
    relations,
    shares,
    settings: {
      get: async (): Promise<Settings | null> => {
        const settingsDoc = doc(settings, 'default');
        const docSnap = await getDoc(settingsDoc);
        return docSnap.exists() ? docSnap.data() as Settings : null;
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
