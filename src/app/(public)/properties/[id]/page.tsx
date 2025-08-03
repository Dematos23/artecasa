
import { getPropertyById } from '@/services/properties';
import { PropertyDetailsClientView } from './PropertyDetailsClientView';

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id);
  
  return <PropertyDetailsClientView property={property} />;
}
