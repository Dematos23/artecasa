
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Logo } from '../Logo';

export function PortalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-casora-primary text-casora-text-on-dark">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/properties" className="text-sm font-medium transition-colors hover:text-casora-secondary">
            Catálogo
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-casora-secondary">
            Contacto
          </Link>
          <Link href="/claims" className="text-sm font-medium transition-colors hover:text-casora-secondary">
            Reclamos
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="secondary" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Ingresar
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
