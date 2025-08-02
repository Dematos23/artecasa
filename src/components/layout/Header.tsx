"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/properties', label: 'Propiedades' },
  { href: '/contact', label: 'Contacto' },
];

export function Header() {
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center">
          <Image src="/logo.png" alt="Artecasa Logo" width={120} height={30} className="h-12 w-auto" />
        </Link>

        <div className="hidden md:flex flex-grow items-center">
          <NavItems />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Alternar menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
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
        </div>
      </div>
    </header>
  );
}
