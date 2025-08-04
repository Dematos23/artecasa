"use client";

import { ContactDetailsClientView } from './ContactDetailsClientView';

export default function ContactDetailsPage({ params }: { params: { id: string } }) {
  const contactId = params.id;
  return <ContactDetailsClientView contactId={contactId} />;
}
