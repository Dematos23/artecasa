import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';

// =================================================================================
// Platform Scope Types & Converters
// =================================================================================

export type PlatformRole = 'owner' | 'admin' | 'support' | 'readonly';

export interface PlatformUser {
  id: string;
  email: string;
  displayName?: string;
  role: PlatformRole;
  status: 'active' | 'suspended';
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export const platformUserConverter: FirestoreDataConverter<PlatformUser> = {
  toFirestore(user: PlatformUser): DocumentData {
    return user;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): PlatformUser {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      status: data.status,
      createdAt: data.createdAt,
      lastLoginAt: data.lastLoginAt,
    };
  },
};

export interface PlatformSettings {
  id: string;
  marketingEnabled: boolean;
  maxPageSize: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const platformSettingsConverter: FirestoreDataConverter<PlatformSettings> =
  {
    toFirestore(settings: PlatformSettings): DocumentData {
      return settings;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): PlatformSettings {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        marketingEnabled: data.marketingEnabled,
        maxPageSize: data.maxPageSize,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    },
  };

// =================================================================================
// Tenant Root Types & Converters
// =================================================================================

export interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'trial';
  createdAt: Timestamp;
  ownerId: string; // The platformUser ID of the owner
}

export const tenantConverter: FirestoreDataConverter<Tenant> = {
  toFirestore(tenant: Tenant): DocumentData {
    return tenant;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Tenant {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      status: data.status,
      createdAt: data.createdAt,
      ownerId: data.ownerId,
    };
  },
};

// =================================================================================
// Tenant Scope Types & Converters (Nested under /tenants/{tenantId})
// =================================================================================

// Re-using the same interfaces for simplicity where possible
export type { Property, Contact, Lead, Claim } from '.';

// Tenant-specific User
export type TenantRole = 'owner' | 'admin' | 'seller' | 'viewer';

export interface TenantUser {
  id: string;
  email: string;
  displayName?: string;
  role: TenantRole;
  status: 'active' | 'suspended';
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export const tenantUserConverter: FirestoreDataConverter<TenantUser> = {
  toFirestore(user: TenantUser): DocumentData {
    return user;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): TenantUser {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      status: data.status,
      createdAt: data.createdAt,
      lastLoginAt: data.lastLoginAt,
    };
  },
};

// Tenant Domain
export interface Domain {
  id: string;
  hostname: string;
  isPrimary: boolean;
  verified: boolean;
  createdAt: Timestamp;
}

export const domainConverter: FirestoreDataConverter<Domain> = {
  toFirestore(domain: Domain): DocumentData {
    return domain;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Domain {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      hostname: data.hostname,
      isPrimary: data.isPrimary,
      verified: data.verified,
      createdAt: data.createdAt,
    };
  },
};

// Tenant Settings
export type { Settings as TenantSettings } from '.';
