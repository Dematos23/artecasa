
"use client";

import Link from 'next/link';
import { Logo } from '../Logo';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaWhatsapp, FaYoutube, FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';


export function PortalFooter() {
  const year = new Date().getFullYear();
  
  const socialIconProps = {
    className: "h-6 w-6 text-casora-on-dark hover:text-casora-secondary transition-colors",
  };

  return (
    <footer className="bg-casora-primary text-casora-on-dark">
      <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
               <Logo className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-casora-on-dark/80">
              Tu socio para encontrar la casa de lujo perfecta.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 font-headline">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-casora-on-dark/80 hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/properties" className="text-sm text-casora-on-dark/80 hover:text-white transition-colors">Propiedades</Link></li>
              <li><Link href="/contact" className="text-sm text-casora-on-dark/80 hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/claims" className="text-sm text-casora-on-dark/80 hover:text-white transition-colors">Reclamos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 font-headline">Síguenos</h3>
            <div className="flex flex-wrap gap-4">
                <a href="#" target="_blank" rel="noopener noreferrer">
                    <FaFacebook {...socialIconProps} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                    <FaInstagram {...socialIconProps} />
                </a>
                 <a href="#" target="_blank" rel="noopener noreferrer">
                    <FaTiktok {...socialIconProps} />
                </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-casora-on-dark/20 text-center text-sm text-casora-on-dark/60">
          <p>&copy; {year} Casora. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

