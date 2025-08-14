

"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Property } from '@/types';
import type { TenantSettings } from '@/types/multitenant';
import { BedDouble, Bath, Car, Maximize, MapPin, Phone, CalendarClock, Building, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getSettings } from '@/services/settings';
import { useAuth } from '@/context/AuthContext';
import { getClientProfile, toggleFavoriteProperty } from '@/services/clients';
import { useToast } from '@/hooks/use-toast';
import { getPropertyById } from '@/services/properties'; // Changed from portal action to direct service

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: -12.046374,
  lng: -77.042793
};

export function PropertyDetailsClientView({ tenantId, propertyId }: { tenantId: string, propertyId: string }) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | undefined | null>(undefined);
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || "",
    preventGoogleFontsLoading: true,
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!tenantId || !propertyId) {
          setProperty(null);
          setLoading(false);
          return;
      }

      setLoading(true);
      try {
        const [prop, settingsData] = await Promise.all([
          getPropertyById(tenantId, propertyId),
          getSettings(tenantId)
        ]);
        
        setProperty(prop);
        setSettings(settingsData);

        if (user && prop) {
            const clientProfile = await getClientProfile(user.uid);
            const isFav = clientProfile?.interestedProperties.some(p => p.propertyId === prop.id) || false;
            setIsFavorite(isFav);
        }

      } catch(error) {
        console.error("Error fetching property details:", error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [tenantId, propertyId, user]);
  
  const handleToggleFavorite = async () => {
    if (!user) {
        toast({ title: "Inicia sesión", description: "Debes iniciar sesión para guardar propiedades." });
        return;
    }
    if (!property) return;

    setIsTogglingFavorite(true);
    try {
        const result = await toggleFavoriteProperty(user.uid, {
            propertyId: property.id,
            propertyTenantId: tenantId, 
        });
        setIsFavorite(result);
        toast({
            title: result ? "Añadido a Favoritos" : "Eliminado de Favoritos",
            description: result ? `"${property.title}" se ha guardado en tu perfil.` : `"${property.title}" se ha eliminado de tus favoritos.`,
        });
    } catch(error) {
        console.error("Error toggling favorite:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar tus favoritos." });
    } finally {
        setIsTogglingFavorite(false);
    }
  }


  const handleWhatsAppInquiry = () => {
    if (!settings?.whatsappNumber || !property) return;
    const propertyUrl = window.location.href;
    const text = `Hola, me interesa la propiedad: "${property.title}".\nPuedes verla aquí: \n${propertyUrl}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodedText}`, '_blank');
  };


  if (loading) {
     return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold">Cargando propiedad...</h1>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold">Propiedad no encontrada</h1>
        <Button asChild className="mt-4">
          <Link href="/properties">Volver a Propiedades</Link>
        </Button>
      </div>
    );
  }
  
  const fullAddress = [property.address, property.district, property.province, property.region].filter(Boolean).join(', ');

  const getPriceDisplay = () => {
    const preferredIsUSD = (property.preferredCurrency === 'USD') || (!property.preferredCurrency && property.modality !== 'alquiler');
    const mainPrice = preferredIsUSD ? property.priceUSD : property.pricePEN;
    const mainSymbol = preferredIsUSD ? '$' : 'S/';
    const secondaryPrice = preferredIsUSD ? property.pricePEN : property.priceUSD;
    const secondarySymbol = preferredIsUSD ? 'S/' : '$';

    return { mainPrice, mainSymbol, secondaryPrice, secondarySymbol };
  };

  const { mainPrice, mainSymbol, secondaryPrice, secondarySymbol } = getPriceDisplay();
  const imageUrl = property.imageUrls?.[0] ?? settings?.defaultPropertyImageUrl ?? '/appartment.webp';

  return (
    <div className="bg-secondary">
      <div className="container mx-auto py-8 md:py-16 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-headline mb-2">{property.title}</h1>
          {fullAddress && <p className="text-base md:text-lg text-muted-foreground flex items-center gap-2"><MapPin size={18} /> {fullAddress}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden mb-8">
              <Image
                src={imageUrl}
                data-ai-hint="luxury property interior"
                alt={property.title}
                width={1200}
                height={800}
                className="w-full h-auto object-cover"
              />
            </Card>

            {property.description && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="font-headline">Descripción de la Propiedad</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{property.description}</p>
                </CardContent>
              </Card>
            )}
             <Card>
              <CardHeader>
                <CardTitle className="font-headline">Ubicación en el Mapa</CardTitle>
              </CardHeader>
              <CardContent>
                {googleMapsApiKey && isLoaded ? (
                  <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={property.location || defaultCenter}
                      zoom={property.location ? 16 : 10}
                  >
                      {property.location && <Marker position={property.location} />}
                  </GoogleMap>
                ) : <p className="text-muted-foreground">El mapa no está disponible en este momento.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-headline">Detalles de la Propiedad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                      {mainSymbol}{Number(mainPrice).toLocaleString()}
                  </p>
                  <p className="text-lg font-normal text-muted-foreground capitalize">
                      {property.modality === 'alquiler'
                          ? '/ mes'
                          : `en ${property.modality}`}{' '}
                      (o {secondarySymbol}{Number(secondaryPrice).toLocaleString()})
                  </p>
                </div>

                <div className="space-y-4 text-foreground">
                  {property.propertyType && <div className="flex justify-between items-center"><span className="text-muted-foreground">Tipo</span> <span className="font-semibold flex items-center gap-2">{property.propertyType} <Building size={18}/></span></div>}
                  {property.bedrooms !== undefined && <div className="flex justify-between items-center"><span className="text-muted-foreground">Dormitorios</span> <span className="font-semibold flex items-center gap-2">{property.bedrooms} <BedDouble size={18}/></span></div>}
                  {property.bathrooms !== undefined && <div className="flex justify-between items-center"><span className="text-muted-foreground">Baños</span> <span className="font-semibold flex items-center gap-2">{property.bathrooms} <Bath size={18}/></span></div>}
                  {property.garage !== undefined && <div className="flex justify-between items-center"><span className="text-muted-foreground">Cochera</span> <span className="font-semibold flex items-center gap-2">{property.garage} <Car size={18}/></span></div>}
                  {property.area_m2 !== undefined && <div className="flex justify-between items-center"><span className="text-muted-foreground">Área (m²)</span> <span className="font-semibold flex items-center gap-2">{property.area_m2.toLocaleString()} <Maximize size={18}/></span></div>}
                  {property.antiquity !== undefined && (
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Antigüedad</span>
                        <span className="font-semibold flex items-center gap-2">
                            {property.antiquity === 0 ? 'A estrenar' : `${property.antiquity} años`}
                            <CalendarClock size={18}/>
                        </span>
                    </div>
                   )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-8">
                    <Button size="lg" className="w-full" onClick={handleWhatsAppInquiry} disabled={!settings?.whatsappNumber}>
                        <Phone className="mr-2" />
                        Consultar
                    </Button>
                     <Button size="lg" variant="outline" className="w-full" onClick={handleToggleFavorite} disabled={isTogglingFavorite || authLoading}>
                        {isTogglingFavorite ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Heart className={`mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}/>
                        )}
                        {isFavorite ? 'Favorito' : 'Guardar'}
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
