"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/properties', label: 'Propiedades' },
  { href: '/contact', label: 'Contacto' },
];

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
  };


  const NavItems = ({ className }: { className?: string }) => (
    <nav className={cn('flex items-center gap-4 lg:gap-6', className)}>
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile Menu Toggle (Left) */}
        <div className="md:hidden flex-1 flex justify-start">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Alternar menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
               <SheetDescription className="sr-only">
                 Menú principal de navegación del sitio Artecasa.
               </SheetDescription>
              <div className="flex flex-col gap-4 p-4">
                <Link href="/" className="mr-6 flex items-center mb-4">
                  <Image src="/logo.png" alt="Artecasa Logo" width={120} height={30} className="h-8 w-auto" />
                </Link>
                <NavItems className="flex-col items-start gap-4" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Logo */}
        <div className="flex justify-center md:justify-start flex-1 md:flex-none">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Artecasa Logo" width={120} height={30} className="h-12 w-auto" />
            </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-grow items-center justify-center">
          <NavItems />
        </div>

        {/* Login/User Avatar (Right) */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                     <Link href="/admin">
                        <User className="mr-2 h-4 w-4" />
                        <span>Panel Admin</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
             <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
