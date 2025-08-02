"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/contact', label: 'Contact' },
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-[3%] md:px-[5%] xl:px-[12%]">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Logo className="h-6 w-auto text-primary" />
          <span className="font-bold font-headline text-foreground">Artecasa</span>
        </Link>

        <div className="hidden md:flex flex-grow items-center">
          <NavItems />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/login">Admin Login</Link>
          </Button>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 p-4">
                  <Link href="/" className="mr-6 flex items-center gap-2 mb-4">
                    <Logo className="h-6 w-auto text-primary" />
                    <span className="font-bold font-headline">Artecasa</span>
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
