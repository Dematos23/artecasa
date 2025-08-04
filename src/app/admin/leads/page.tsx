
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
import { MoreHorizontal, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Lead } from '@/types';
import React, { useState, useEffect, useCallback } from 'react';
import { getLeads, deleteLead, convertLeadToContact } from '@/services/leads';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const leadsData = await getLeads();
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
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchLeads();
    } else if (!authLoading && !user) {
      setLoading(false);
      console.log("User not authenticated. Cannot fetch leads.");
    }
  }, [authLoading, user, fetchLeads]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLead(id);
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
    try {
        await convertLeadToContact(lead);
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


  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold font-headline">Bandeja de Entrada de Leads</h1>
            <p className="text-muted-foreground">Gestiona las nuevas consultas del formulario de contacto.</p>
        </div>
        </div>

        {loading ? (
        <p>Cargando leads...</p>
        ) : (
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
                    {leads.map((lead) => (
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
                 {leads.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                        No hay nuevos leads en este momento.
                    </div>
                 )}
            </CardContent>
        </Card>
        )}
    </>
  );
}
