
"use client";

import { Facebook, Instagram, Linkedin, MessageCircle, Send, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Settings } from '@/types';
import { getSettings } from '@/services/settings';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.52.02c1.31-.02 2.61.16 3.8.59v5.15a4.2 4.2 0 0 1-3.2-2.32c-1.4-2.58-3.98-4.5-7.12-4.52v5.5a8.9 8.9 0 0 0 4.24 7.64v5.31c-3.1-.05-6.02-.9-8.36-2.5v-5.5a4.2 4.2 0 0 1 3.2-2.32c1.4-2.58 3.98-4.5 7.12-4.52z"/><path d="M12.52.02c1.31-.02 2.61.16 3.8.59v5.15a4.2 4.2 0 0 1-3.2-2.32c-1.4-2.58-3.98-4.5-7.12-4.52v5.5a8.9 8.9 0 0 0 4.24 7.64v5.31c-3.1-.05-6.02-.9-8.36-2.5v-5.5a4.2 4.2 0 0 1 3.2-2.32c1.4-2.58 3.98-4.5 7.12-4.52z"/></svg>
);


export function Footer() {
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    async function fetchSettingsData() {
        const settingsData = await getSettings();
        setSettings(settingsData);
    }
    fetchSettingsData();
  }, []);

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
               <Image 
                    src={settings?.logoUrl || '/logo.png'} 
                    alt="Artecasa Logo" 
                    width={120} 
                    height={30} 
                    className="h-12 w-auto" 
                />
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
            <div className="flex flex-wrap gap-4">
              {settings?.showFacebook && settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent-foreground transition-colors">
                    <Facebook size={24} />
                </a>
              )}
              {settings?.showInstagram && settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent-foreground transition-colors">
                    <Instagram size={24} />
                </a>
              )}
               {settings?.showTiktok && settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent-foreground transition-colors">
                    <TiktokIcon className="h-6 w-6" />
                </a>
              )}
              {settings?.showX && settings.xUrl && (
                <a href={settings.xUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent-foreground transition-colors">
                    <XIcon className="h-6 w-6" />
                </a>
              )}
              {settings?.showYoutube && settings.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent-foreground transition-colors">
                    <Youtube size={24} />
                </a>
              )}
              {settings?.showWhatsapp && settings.whatsappUrl && (
                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent-foreground transition-colors">
                    <MessageCircle size={24} />
                </a>
              )}
              {settings?.showLinkedin && settings.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent-foreground transition-colors">
                    <Linkedin size={24} />
                </a>
              )}
              {settings?.showTelegram && settings.telegramUrl && (
                <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent-foreground transition-colors">
                    <Send size={24} />
                </a>
              )}
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
