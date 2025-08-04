'use server';

import { addContact } from '@/services/contacts';
import { redirect } from 'next/navigation';

export async function handleContactSubmit(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const message = formData.get('message') as string;

  // Split name into first and last names. This is a simple split.
  const nameParts = name.split(' ');
  const firstname = nameParts[0] || '';
  const firstlastname = nameParts.slice(1).join(' ') || '';

  try {
    await addContact({
      firstname,
      firstlastname,
      email,
      phone,
      notes: message,
      types: ['comprador', 'arrendatario'], // Default types for a public contact form submission
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    // Optionally, you could redirect to an error page or show a toast
    // For now, we'll let it fail silently on the server and log the error.
    // In a real-world app, you'd want better error handling here.
    return;
  }

  redirect('/contact/thank-you');
}
