
'use server';

import { addLead } from '@/services/leads';
import { redirect } from 'next/navigation';

export async function handleContactSubmit(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const message = formData.get('message') as string;

  try {
    await addLead({
      name,
      email,
      phone,
      message,
    });
  } catch (error) {
    console.error('Error submitting lead form:', error);
    // Optionally, you could redirect to an error page or show a toast
    // For now, we'll let it fail silently on the server and log the error.
    // In a real-world app, you'd want better error handling here.
    return;
  }

  redirect('/contact/thank-you');
}
