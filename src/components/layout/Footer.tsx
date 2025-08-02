import { Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto py-12 px-[3%] md:px-[5%] xl:px-[12%]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
               <Image src="/logo.png" alt="Artecasa Logo" width={120} height={30} className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Tu socio para encontrar la casa de lujo perfecta.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-headline">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link href="/properties" className="text-sm text-muted-foreground hover:text-primary transition-colors">Propiedades</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contacto</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Acceso Admin</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-headline">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-primary hover:text-accent-foreground transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-primary hover:text-accent-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tiktok"><path d="M12.52.02c1.31-.02 2.61.16 3.8.59v5.15a4.2 4.2 0 0 1-3.2-2.32c-1.4-2.58-3.98-4.5-7.12-4.52v5.5a8.9 8.9 0 0 0 4.24 7.64v5.31c-3.1-.05-6.02-.9-8.36-2.5v-5.5a4.2 4.2 0 0 1 3.2-2.32c1.4-2.58 3.98-4.5 7.12-4.52z"/><path d="M12.52.02c1.31-.02 2.61.16 3.8.59v5.15a4.2 4.2 0 0 1-3.2-2.32c-1.4-2.58-3.98-4.5-7.12-4.52v5.5a8.9 8.9 0 0 0 4.24 7.64v5.31c-3.1-.05-6.02-.9-8.36-2.5v-5.5a4.2 4.2 0 0 1 3.2-2.32c1.4-2.58 3.98-4.5 7.12-4.52z"/></svg>
              </a>
              <a href="#" className="text-primary hover:text-accent-foreground transition-colors">
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {year} Artecasa. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
