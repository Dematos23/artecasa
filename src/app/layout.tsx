import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext';
import { TenantProvider } from '@/context/TenantContext'; // Import TenantProvider

// This function can no longer be called from a Server Component Root Layout
// because it requires a tenantId, which is not available here globally.
// We will move font loading to be client-side or pass settings down.
// For now, we will use a default.
// async function getFontSettings() {
//   const settings = await getSettings(); // This now requires a tenantId
//   const bodyFont = settings?.bodyFont || 'Montserrat';
//   const headlineFont = settings?.headlineFont || 'Montserrat';
//   return { bodyFont, headlineFont };
// }

export const metadata: Metadata = {
  title: 'Casora - Inmobiliaria de Lujo',
  description: 'Encuentra la casa de tus sueños con Casora. Especializados en propiedades de lujo.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { bodyFont, headlineFont } = await getFontSettings();
  const bodyFont = 'Montserrat';
  const headlineFont = 'Montserrat';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${bodyFont.replace(/ /g, '+')}:wght@400;700&family=${headlineFont.replace(/ /g, '+')}:wght@400;700&display=swap`;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontUrl} rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={cn('font-body antialiased min-h-screen')}>
        <AuthProvider>
          <TenantProvider>
            {children}
            <Toaster />
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
