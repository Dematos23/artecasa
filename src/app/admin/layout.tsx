
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { redirect, usePathname } from 'next/navigation';
import { Home, Building2, Users, User, LogOut, ArrowLeft, Settings, Inbox, Loader2 } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import React, { useState, useEffect } from 'react';
import { getSettings } from '@/services/settings';
import type { Settings as AppSettings } from '@/types';


function AdminSidebarButton({ href, children }: { href: string, children: React.ReactNode }) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  
  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuButton asChild isActive={pathname.startsWith(href)} onClick={handleClick}>
      <Link href={href}>
        {children}
      </Link>
    </SidebarMenuButton>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  React.useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
    async function fetchSettings() {
      const settingsData = await getSettings();
      setSettings(settingsData);
    }
    fetchSettings();
  }, [user, loading]);
  
  const handleLogout = async () => {
    await auth.signOut();
    redirect('/login');
  };

  if (loading || !user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
           <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider>
        <div className="flex h-screen">
        <Sidebar>
            <SidebarHeader>
            <Link href="/" className="flex items-center justify-center">
                <Image 
                    src={settings?.logoUrl || "/logo.png"} 
                    alt="Artecasa Logo" 
                    width={160} 
                    height={40} 
                    className="h-16 w-auto" 
                    priority 
                />
            </Link>
            </SidebarHeader>
            <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                <AdminSidebarButton href="/admin">
                    <Home />
                    Panel de Administrador
                </AdminSidebarButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <AdminSidebarButton href="/admin/properties">
                    <Building2 />
                    Propiedades
                  </AdminSidebarButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <AdminSidebarButton href="/admin/leads">
                    <Inbox />
                    Leads
                  </AdminSidebarButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <AdminSidebarButton href="/admin/contacts">
                    <Users />
                    Contactos
                  </AdminSidebarButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <AdminSidebarButton href="/admin/settings">
                    <Settings />
                    Configuración
                  </AdminSidebarButton>
                </SidebarMenuItem>
            </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <ArrowLeft />
                        Volver al Inicio
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                <div className="flex items-center gap-2 p-2 rounded-md bg-secondary">
                <User className="h-8 w-8 rounded-full bg-primary/20 text-primary p-1.5" />
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">Usuario Admin</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                    <LogOut />
                </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
        <main className="flex-1 w-full overflow-y-auto">
            <header className="p-4 sm:p-6 lg:p-8 flex items-center md:hidden border-b">
                <SidebarTrigger />
                <h1 className='text-xl font-bold font-headline ml-4'>Panel de Administrador</h1>
            </header>
             <div className="p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </main>
        </div>
    </SidebarProvider>
  );
}
