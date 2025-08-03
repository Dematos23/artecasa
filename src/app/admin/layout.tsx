"use client";

import Link from 'next/link';
import Image from 'next/image';
import { redirect, usePathname } from 'next/navigation';
import { Home, Building2, MessageSquare, User, LogOut } from 'lucide-react';

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
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import React from 'react';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  React.useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
  }, [user, loading]);
  
  const handleLogout = async () => {
    await auth.signOut();
    redirect('/login');
  };

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
          <p>Cargando...</p>
        </div>
    );
  }

  if (!user) {
    return null;
  }


  return (
    <SidebarProvider>
        <div className="flex h-screen">
        <Sidebar>
            <SidebarHeader>
            <Link href="/" className="flex items-center">
                <Image src="/logo.png" alt="Artecasa Logo" width={120} height={30} className="h-8 w-auto" />
            </Link>
            </SidebarHeader>
            <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                    <Link href="/admin">
                    <Home />
                    Panel
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/properties')}>
                    <Link href="/admin/properties">
                    <Building2 />
                    Propiedades
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/contacts')}>
                    <Link href="/admin/contacts">
                    <MessageSquare />
                    Contactos
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            <div className="border-t -mx-2 p-2 pt-2">
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
            </div>
            </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
            <header className="p-4 sm:p-6 lg:p-8 flex items-center md:hidden border-b">
                <SidebarTrigger />
                <h1 className='text-xl font-bold font-headline ml-4'>Panel Admin</h1>
            </header>
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
        </div>
    </SidebarProvider>
  );
}
