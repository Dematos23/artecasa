"use client";

import { PropertyDetailsClientView } from './PropertyDetailsClientView';

export default function AdminPropertyDetailsPage({ params }: { params: { id: string } }) {
  const propertyId = params.id;
  
  return <PropertyDetailsClientView propertyId={propertyId} />;
}
