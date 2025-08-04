
"use client";

import { PropertyDetailsClientView } from './PropertyDetailsClientView';

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  return <PropertyDetailsClientView propertyId={params.id} />;
}
