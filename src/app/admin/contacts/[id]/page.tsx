
import { getContactById } from '@/services/contacts';
import { getPropertiesByOwnerId, getPropertiesByIds } from '@/services/properties';
import { ContactDetailsClientView } from './ContactDetailsClientView';
import { redirect } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default async function ContactDetailsPage({ params }: { params: { id: string } }) {
  // Note: This component is an RSC, useAuth will not work here directly.
  // Authentication check should be done on the client-side component or a server-side guard.
  if (!user) {
    redirect('/login');
  }

  const contactId = params.id;
  const contactData = await getContactById(contactId);  
  let ownedProperties = [];
  let interestedProperties = [];

  if (contactData) {
    if (contactData.types.includes('vendedor') || contactData.types.includes('arrendador')) {
      ownedProperties = await getPropertiesByOwnerId(contactData.id);
    }
    if ((contactData.types.includes('comprador') || contactData.types.includes('arrendatario')) && contactData.interestedPropertyIds && contactData.interestedPropertyIds.length > 0) {
      interestedProperties = await getPropertiesByIds(contactData.interestedPropertyIds);
    }
  }
  
  return <ContactDetailsClientView contact={contactData} ownedProperties={ownedProperties} interestedProperties={interestedProperties} />;
}
