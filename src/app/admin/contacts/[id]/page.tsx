
"use client";

import { ContactDetailsClientView } from './ContactDetailsClientView';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';

export default function ContactDetailsPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();

  if (loading) {
     return (
      <div className="container mx-auto py-24 text-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  return <ContactDetailsClientView contactId={params.id} />;
}
