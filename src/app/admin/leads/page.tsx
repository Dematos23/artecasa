
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MoreHorizontal, UserPlus, Trash2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Lead } from '@/types';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getLeads, deleteLead, convertLeadToContact } from '@/services/leads';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useTenant } from '@/context/TenantContext';

export default function AdminLeadsPage() {
  const { tenantId } = useTenant();
  const [leads, setLeads] = useState<Lead[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeads = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const leadsData = await getLeads(tenantId);
      setLeads(leadsData);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los leads.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, tenantId]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchLeads();
    } else if (!authLoading && !user) {
      setLoading(false);
      console.log("User not authenticated. Cannot fetch leads.");
    }
  }, [authLoading, user, fetchLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const lowercasedQuery = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(lowercasedQuery) ||
        lead.email.toLowerCase().includes(lowercasedQuery) ||
        (lead.phone && lead.phone.toLowerCase().includes(lowercasedQuery)) ||
        lead.message.toLowerCase().includes(lowercasedQuery)
      );
    });
  }, [leads, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!tenantId) return;
    try {
      await deleteLead(tenantId, id);
      toast({
        title: "Éxito",
        description: "El lead se ha eliminado correctamente.",
      });
      await fetchLeads(); // Refetch
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el lead.",
      });
    }
  };
  
  const handleConvert = async (lead: Lead) => {
    if (!tenantId) return;
    try {
        await convertLeadToContact(tenantId, lead);
        toast({
            title: "Éxito",
            description: "El lead se ha convertido a contacto.",
        });
        await fetchLeads(); // Refetch
    } catch (error) {
        console.error("Error converting lead:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo convertir el lead.",
        });
    }
  };

  if (loading) {
    return null;
  }


  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold font-headline">Bandeja de Entrada de Leads</h1>
            <p className="text-muted-foreground">Gestiona las nuevas consultas del formulario de contacto.</p>
        </div>
        </div>

        <div className="mb-6">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre, correo, teléfono o mensaje..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full max-w-lg"
                />
            </div>
        </div>


        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Mensaje</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{format(new Date(lead.date as any), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="max-w-xs truncate">{lead.message}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleConvert(lead)}>
                                    <UserPlus className="mr-2 h-4 w-4"/>
                                    Convertir a Contacto
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                 {filteredLeads.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                       {searchQuery ? "No se encontraron leads que coincidan con la búsqueda." : "No hay nuevos leads en este momento."}
                    </div>
                 )}
            </CardContent>
        </Card>
    </>
  );
}
