import Link from 'next/link';
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
import { Logo } from '@/components/Logo';
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
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-6 w-auto text-primary" />
            <span className="font-bold font-headline text-foreground">Artecasa</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin">
                  <Home />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/properties">
                  <Building2 />
                  Properties
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/contacts">
                  <MessageSquare />
                  Contacts
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
                <span className="text-sm font-semibold">Admin User</span>
                <span className="text-xs text-muted-foreground">admin@artecasa.com</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <LogOut />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
