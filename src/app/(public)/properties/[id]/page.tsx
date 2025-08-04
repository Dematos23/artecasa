
import { getPropertyById } from '@/services/properties';
import { PropertyDetailsClientView } from './PropertyDetailsClientView';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';


export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {

  const user = auth.currentUser;

  if (!user) {
    redirect('/login');
  }

  const property = await getPropertyById(params.id);
  
  return <PropertyDetailsClientView property={property} />;
}