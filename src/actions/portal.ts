
'use server';

import { db } from '@/lib/firebase-admin';
import type { Property } from '@/types';
import { getFirestore, Filter, FieldPath } from 'firebase-admin/firestore';

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
  {
    filters = {},
    cursor,
    pageSize = 24
  }: {
    filters?: {
        modality?: 'venta' | 'alquiler';
        propertyType?: string;
        bedrooms?: number;
        minPrice?: number;
        maxPrice?: number;
        currency?: 'USD' | 'PEN';
    };
    cursor?: string;
    pageSize?: number;
  } = {}
): Promise<{ properties: Property[]; nextCursor: any[] | null }> {
  const firestore = getFirestore();
  const propertiesCollectionGroup = firestore.collectionGroup('properties');
  
  let q: FirebaseFirestore.Query = propertiesCollectionGroup;

  const constraints: FirebaseFirestore.Filter[] = [Filter.where('featured', '==', true)];

  if (filters.modality && filters.modality !== 'all') {
    constraints.push(Filter.where('modality', '==', filters.modality));
  }
  if (filters.propertyType && filters.propertyType !== 'all') {
    constraints.push(Filter.where('propertyType', '==', filters.propertyType));
  }
  if (filters.bedrooms && filters.bedrooms > 0) {
    constraints.push(Filter.where('bedrooms', '>=', filters.bedrooms));
  }
  
  const priceField = filters.currency === 'PEN' ? 'pricePEN' : 'priceUSD';
  if (filters.minPrice) {
    constraints.push(Filter.where(priceField, '>=', filters.minPrice));
  }
  if (filters.maxPrice) {
    constraints.push(Filter.where(priceField, '<=', filters.maxPrice));
  }

  if (constraints.length > 1) {
      q = q.where(Filter.and(...constraints));
  } else if (constraints.length === 1) {
      q = q.where(constraints[0]);
  }
  
  q = q.orderBy(priceField, 'desc').limit(pageSize);


  if (cursor) {
    q = q.startAfter(JSON.parse(cursor));
  }

  const querySnapshot = await q.get();
  
  const properties = querySnapshot.docs.map(doc => {
    // We need to add the tenantId to the property object from its path
    const tenantId = doc.ref.parent.parent?.id;
    return { id: doc.id, tenantId, ...doc.data() } as Property;
  });

  const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
  // Create a cursor from the values of the fields we ordered by
  const nextCursorValue = lastDoc ? lastDoc.data()[priceField] : null;

  return { properties, nextCursor: nextCursorValue ? [JSON.stringify(nextCursorValue)] : null };
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
    const propertyRef = db.collection('tenants').doc(tenantId).collection('properties').doc(propertyId);
    const docSnap = await propertyRef.get();

    if (docSnap.exists()) {
      const propertyData = docSnap.data() as Property;
      // Enforce the "published" rule on the server
      if (propertyData.featured) {
        return { id: docSnap.id, ...propertyData, tenantId };
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching property ${propertyId} for tenant ${tenantId}:`, error);
    return null;
  }
}
