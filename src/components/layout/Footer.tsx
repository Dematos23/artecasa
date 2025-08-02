import { Logo } from '@/components/Logo';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto py-12 px-[3%] md:px-[5%] xl:px-[12%]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-auto text-primary" />
              <span className="text-xl font-bold font-headline text-foreground">Artecasa</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your partner in finding the perfect luxury home.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-headline">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/properties" className="text-sm text-muted-foreground hover:text-primary transition-colors">Properties</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Admin Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-headline">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-primary hover:text-accent-foreground transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-primary hover:text-accent-foreground transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-primary hover:text-accent-foreground transition-colors">
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {year} Artecasa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
