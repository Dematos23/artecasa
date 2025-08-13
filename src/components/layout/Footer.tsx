
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { TenantSettings } from '@/types/multitenant';
import { getSettings } from '@/services/settings';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaWhatsapp, FaYoutube, FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useTenant } from '@/context/TenantContext';


export function Footer() {
  const year = new Date().getFullYear();
  const { tenantId } = useTenant();
  const [settings, setSettings] = useState<TenantSettings | null>(null);

  useEffect(() => {
    async function fetchSettingsData() {
        if (!tenantId) return;
        const settingsData = await getSettings(tenantId);
        setSettings(settingsData);
    }
    fetchSettingsData();
  }, [tenantId]);

  const socialIconProps = {
    className: "h-6 w-6 text-primary hover:text-accent-foreground transition-colors",
  };

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
              <li><Link href="/claims" className="text-sm text-muted-foreground hover:text-primary transition-colors">Reclamos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-headline">Síguenos</h3>
            <div className="flex flex-wrap gap-4">
              {settings?.showFacebook && settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                    <FaFacebook {...socialIconProps} />
                </a>
              )}
              {settings?.showInstagram && settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <FaInstagram {...socialIconProps} />
                </a>
              )}
               {settings?.showTiktok && settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer">
                    <FaTiktok {...socialIconProps} />
                </a>
              )}
              {settings?.showX && settings.xUrl && (
                <a href={settings.xUrl} target="_blank" rel="noopener noreferrer">
                    <FaXTwitter {...socialIconProps} />
                </a>
              )}
              {settings?.showYoutube && settings.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <FaYoutube {...socialIconProps} />
                </a>
              )}
              {settings?.showWhatsapp && settings.whatsappUrl && (
                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp {...socialIconProps} />
                </a>
              )}
              {settings?.showLinkedin && settings.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin {...socialIconProps} />
                </a>
              )}
              {settings?.showTelegram && settings.telegramUrl && (
                <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer">
                    <FaTelegramPlane {...socialIconProps} />
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
