
'use server';

export async function handleContactSubmit(formData: FormData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    console.log('New Contact Submission:', { name, email, message });
}
