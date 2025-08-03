import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Home, Building2, MessageSquare, User, LogOut } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real application, you would check for user authentication here.
  // For example, using Firebase Auth on the server-side.
  const isAuthenticated = true; // Placeholder for demonstration

  if (!isAuthenticated) {
    redirect('/login');
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
                <SidebarMenuButton asChild>
                  <Link href="/admin">
                    <Home />
                    Panel
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/properties">
                    <Building2 />
                    Propiedades
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
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
                  <span className="text-xs text-muted-foreground">admin@artecasa.com</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <LogOut />
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
             <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
