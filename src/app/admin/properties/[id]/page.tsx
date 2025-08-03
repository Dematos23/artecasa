
import { getPropertyById } from '@/services/properties';
import { PropertyDetailsClientView } from './PropertyDetailsClientView';

export default async function AdminPropertyDetailsPage({ params }: { params: { id: string } }) {
  const propertyId = params.id;
  const property = await getPropertyById(propertyId);
  
  return <PropertyDetailsClientView propertyId={propertyId} initialProperty={property} />;
}
