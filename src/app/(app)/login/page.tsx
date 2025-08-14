
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
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

const auth = getAuth(app);

export default function LoginPage() {
  const { tenantId } = useTenant();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const { toast } = useToast();

   useEffect(() => {
    async function fetchSettingsData() {
        // Pass tenantId (which can be null) to getSettings
        const settingsData = await getSettings(tenantId);
        setSettings(settingsData);
    }
    fetchSettingsData();
  }, [tenantId]);

  useEffect(() => {
    if (!loading && user) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            try {
                await createUserWithEmailAndPassword(auth, email, password);
            } catch (creationError: any) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo crear la cuenta: " + creationError.message,
                });
            }
        } else {
             toast({
                variant: "destructive",
                title: "Error de inicio de sesión",
                description: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
             });
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
        <p>Cargando...</p>
      </div>
    );
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
