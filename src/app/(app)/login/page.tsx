
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, type User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getSettings } from '@/services/settings';
import type { Settings } from '@/types';
import { useTenant } from '@/context/TenantContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const auth = getAuth(app);

// In a real multi-tenant app, this would be more dynamic.
const HARDCODED_TENANT_ID = 'artecasa-test';

async function isUserAgent(user: User): Promise<boolean> {
  const agentRef = doc(db, 'tenants', HARDCODED_TENANT_ID, 'agents', user.uid);
  const docSnap = await getDoc(agentRef);
  return docSnap.exists();
}


export default function LoginPage() {
  // Although this page is in the (app) group, the login logic itself doesn't need a tenantId
  // The redirection logic will handle sending the user to the correct tenant's admin panel.
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const { toast } = useToast();

   useEffect(() => {
    async function fetchSettingsData() {
        // Fetch settings for the hardcoded tenant for branding purposes on the login page
        const settingsData = await getSettings(HARDCODED_TENANT_ID);
        setSettings(settingsData);
    }
    fetchSettingsData();
  }, []);

  useEffect(() => {
    if (!loading && user) {
        // If user is already logged in, check their role and redirect
        handleRedirection(user);
    }
  }, [user, loading]);

  const handleRedirection = async (loggedInUser: User) => {
      const isAgent = await isUserAgent(loggedInUser);
      if (isAgent) {
        // Redirect to the app subdomain for admin tasks.
        // In local dev, this might not work as expected without host file mapping.
        // For production, ensure app.casora.pe is configured.
        window.location.href = 'https://app.casora.pe/admin';
      } else {
        // It's a client, redirect to the main portal homepage.
        router.push('/');
      }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // On successful login, handle redirection
      await handleRedirection(userCredential.user);
    } catch (error: any) {
        // If user doesn't exist, we don't create them here anymore.
        // Agent creation should be a separate admin process.
        // Client creation happens on the main portal.
         toast({
            variant: "destructive",
            title: "Error de inicio de sesión",
            description: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
         });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
        <p>Cargando...</p>
      </div>
    );
  }
  
  // If user is already logged in, the useEffect will handle redirection.
  // We show null to prevent a flash of the login page.
  if (user) {
    return null;
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image 
                src={settings?.logoUrl || "/logo.png"} 
                alt="Artecasa Logo" 
                width={240} 
                height={60} 
                className="h-20 w-auto" 
                priority 
            />
          </div>
          <CardTitle className="font-headline text-2xl">Acceso de Administrador</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
