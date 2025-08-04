// Elimina la directiva "use client" para que sea un Server Component
import { PropertyDetailsClientView } from './PropertyDetailsClientView';

interface AdminPropertyDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function AdminPropertyDetailsPage({ params }: AdminPropertyDetailsPageProps) {
  const propertyId = params.id;
  
  return <PropertyDetailsClientView propertyId={propertyId} />;
}