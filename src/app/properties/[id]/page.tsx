

"use client";

import { useParams } from 'next/navigation';
import { PropertyDetailsClientView } from './PropertyDetailsClientView';

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;

  return <PropertyDetailsClientView propertyId={propertyId} />;
}
