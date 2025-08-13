import type {
    DocumentData,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    Timestamp
} from 'firebase/firestore';
import type { Property } from '.';

// =================================================================================
// 1. PLATFORM SCOPE (ROOT COLLECTIONS)
// =================================================================================

// For Casora's internal team
export type PlatformRole = 'admin';

export interface PlatformUser {
    id: string;
    email: string;
    displayName?: string;
    role: PlatformRole;
    status: 'active' | 'suspended';
    createdAt: Timestamp;
    lastLoginAt?: Timestamp;
}

// Global settings for the entire Casora platform
export interface PlatformSettings {
    id: string; // Typically a singleton document, e.g., 'default'
    marketingEnabled: boolean;
    maxPageSize: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// =================================================================================
// 2. CLIENT SCOPE (ROOT COLLECTION)
// =================================================================================

// End-users of the main portal (casora.pe)
export interface ClientProfile {
    id: string; // Corresponds to Firebase Auth UID
    email: string;
    displayName?: string;
    photoURL?: string;
    interestedProperties: InterestedProperty[];
    lookingFor?: Partial<Property>; // Optional search criteria
    visibility?: {
        shareWithAgents: boolean; // Consent to share profile with property agents
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Reference to a property a client is interested in
export interface InterestedProperty {
    tenantId: string;
    propertyId: string;
    host?: string; // Optional: The domain where the property was favorited
    addedAt: Timestamp;
}


// =================================================================================
// 3. TENANT SCOPE (NESTED UNDER /tenants/{tenantId})
// =================================================================================

// Represents an individual real estate agency
export interface Tenant {
    id: string;
    name: string;
    status: 'active' | 'suspended' | 'trial';
    createdAt: Timestamp;
    ownerId: string; // The platformUser ID of the owner
}

// Users who belong to a specific tenant (e.g., real estate agents)
export type AgentRole = 'manager' | 'agent';

export interface Agent {
    id: string; // Corresponds to Firebase Auth UID
    email: string;
    displayName?: string;
    role: AgentRole;
    status: 'active' | 'suspended';
    tenantId: string;
    createdAt: Timestamp;
    lastLoginAt?: Timestamp;
}

// Custom domains associated with a tenant
export interface Domain {
    id: string; // The hostname itself
    tenantId: string;
    isPrimary: boolean;
    verified: boolean;
    createdAt: Timestamp;
}

// A relationship between a Client/Contact and a Property
export type RelationSubjectType = 'client' | 'contact';
export type RelationRole = 'Owner' | 'Interested' | 'Applicant' | 'Tenant' | 'Buyer';
export type RelationStatus = 'new' | 'verified' | 'matched' | 'rejected';
export type RelationSource = 'client-favorite' | 'agent-link' | 'import';

export interface Relation {
    id: string;
    tenantId: string; // The tenant that "owns" this relation (the agent's tenant)
    subjectType: RelationSubjectType;
    subjectId: string; // ID of the client or contact
    propertyTenantId: string; // The tenant that owns the property
    propertyId: string;
    role: RelationRole;
    status?: RelationStatus;
    source?: RelationSource;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// A shareable, public link to a curated list of properties
export interface Share {
    id: string;
    token: string; // Secure, random token for the public URL
    properties: Array<{
        propertyTenantId: string;
        propertyId: string;
    }>;
    contactId?: string; // Optional: Link to a CRM contact
    expiresAt?: Timestamp;
    createdBy: string; // Agent's UID
    createdAt: Timestamp;
}


// =================================================================================
// DATA CONVERTERS
// =================================================================================

// Generic converter factory
const createConverter = <T>(): FirestoreDataConverter<T> => ({
    toFirestore(data: T): DocumentData {
        return data as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
        return { id: snapshot.id, ...snapshot.data(options) } as T;
    },
});

export const platformUserConverter = createConverter<PlatformUser>();
export const platformSettingsConverter = createConverter<PlatformSettings>();
export const clientProfileConverter = createConverter<ClientProfile>();
export const tenantConverter = createConverter<Tenant>();
export const agentConverter = createConverter<Agent>();
export const domainConverter = createConverter<Domain>();
export const relationConverter = createConverter<Relation>();
export const shareConverter = createConverter<Share>();
