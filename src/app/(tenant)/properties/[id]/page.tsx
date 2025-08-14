
"use client";

import { useParams } from 'next/navigation';
import { PropertyDetailsClientView } from './PropertyDetailsClientView';
import { useTenant } from '@/context/TenantContext';

export default function PropertyDetailsPage() {
  const params = useParams();
  const { tenantId } = useTenant();
  const propertyId = params.id as string;

  if (!tenantId) {
      // This view should not be rendered without a tenant.
      // The parent layout/page should handle the notFound case.
      return null;
  }

  return <PropertyDetailsClientView tenantId={tenantId} propertyId={propertyId} />;
}
