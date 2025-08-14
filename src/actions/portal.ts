'use server';

import { db } from '@/lib/firebase-admin';
import type { Property } from '@/types';
import {
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  type Query,
} from 'firebase-admin/firestore';

/**
 * Lists published properties from all tenants for the main public portal.
 * This is a server-side action with privileged access.
 *
 * @param filters - The filters to apply to the property list.
 * @param cursor - An opaque cursor for pagination.
 * @param pageSize - The number of properties to retrieve per page.
 * @returns An object containing the list of properties and the next cursor.
 */
export async function listPublicPropertiesPortal(
  filters: {
    modality?: 'venta' | 'alquiler';
    propertyType?: string;
    bedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    currency?: 'USD' | 'PEN';
    // Note: Full-text search or complex location filtering might require a dedicated search service like Algolia/Typesense.
    // Simple filtering by exact district/province/region can be added here if needed.
  } = {},
  cursor?: string, // The cursor should be the array of values from the previous 'orderBy' fields
  pageSize: number = 24
): Promise<{ properties: Property[]; nextCursor: any[] | null }> {

  const propertiesCollection = collectionGroup(db, 'properties');
  
  let q: Query<Property> = query(propertiesCollection as Query<Property>, where('featured', '==', true));
  
  const constraints = [];

  if (filters.modality && filters.modality !== 'all') {
    constraints.push(where('modality', '==', filters.modality));
  }
  if (filters.propertyType && filters.propertyType !== 'all') {
    constraints.push(where('propertyType', '==', filters.propertyType));
  }
  if (filters.bedrooms && filters.bedrooms > 0) {
    constraints.push(where('bedrooms', '>=', filters.bedrooms));
  }
  
  const priceField = filters.currency === 'PEN' ? 'pricePEN' : 'priceUSD';
  if (filters.minPrice) {
    constraints.push(where(priceField, '>=', filters.minPrice));
  }
  if (filters.maxPrice) {
    constraints.push(where(priceField, '<=', filters.maxPrice));
  }

  q = query(q, ...constraints, orderBy(priceField, 'desc'), limit(pageSize));

  if (cursor) {
    q = query(q, startAfter(JSON.parse(cursor)));
  }

  const querySnapshot = await getDocs(q);
  
  const properties = querySnapshot.docs.map(doc => {
    // We need to add the tenantId to the property object from its path
    const tenantId = doc.ref.parent.parent?.id;
    return { id: doc.id, tenantId, ...doc.data() } as Property;
  });

  const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
  // Create a cursor from the values of the fields we ordered by
  const nextCursor = lastDoc ? JSON.stringify(lastDoc.data()[priceField]) : null;

  return { properties, nextCursor: nextCursor ? [nextCursor] : null };
}

/**
 * Safely retrieves a single published property for the portal's detail page.
 * It checks if the property is published before returning it.
 *
 * @param {object} params - The parameters for getting the property.
 * @param {string} params.tenantId - The ID of the tenant who owns the property.
 * @param {string} params.propertyId - The ID of the property.
 * @returns {Promise<Property | null>} The property data or null if not found or not published.
 */
export async function getPropertyPortal({
  tenantId,
  propertyId,
}: {
  tenantId: string;
  propertyId: string;
}): Promise<Property | null> {
  try {
    const propertyRef = doc(db, 'tenants', tenantId, 'properties', propertyId);
    const docSnap = await getDoc(propertyRef);

    if (docSnap.exists()) {
      const propertyData = docSnap.data() as Property;
      // Enforce the "published" rule on the server
      if (propertyData.featured) {
        return { id: docSnap.id, ...propertyData };
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching property ${propertyId} for tenant ${tenantId}:`, error);
    return null;
  }
}
