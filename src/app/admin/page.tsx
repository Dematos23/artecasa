
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Eye, Loader2 } from 'lucide-react';
import { getProperties } from '@/services/properties';
import { getContacts } from '@/services/contacts';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [propertyCount, setPropertyCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [properties, contacts] = await Promise.all([
          getProperties(),
          getContacts(),
        ]);
        setPropertyCount(properties.length);
        setContactCount(contacts.length);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Panel de Administración</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propiedades Totales</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{propertyCount}</div>}
            <p className="text-xs text-muted-foreground">Propiedades activas en el sistema.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{contactCount}</div>}
            <p className="text-xs text-muted-foreground">Total de contactos registrados.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas al Sitio</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,402</div>
            <p className="text-xs text-muted-foreground">(Dato de ejemplo)</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold font-headline mb-4">Acciones Rápidas</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Aquí irían las acciones rápidas relacionadas con la administración y los formularios de gestión de contenido del sitio.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
