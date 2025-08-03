
import { getContactById } from '@/services/contacts';
import { getPropertiesByOwnerId, getPropertiesByIds } from '@/services/properties';
import { ContactDetailsClientView } from './ContactDetailsClientView';

export default async function ContactDetailsPage({ params }: { params: { id: string } }) {
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
