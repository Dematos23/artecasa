
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import type { Property } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, MapPin, X, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getProperties } from '@/services/properties';
import { Skeleton } from '@/components/ui/skeleton';
import { peruLocations } from '@/lib/peru-locations';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useClickAway } from 'react-use';
import { Label } from '@/components/ui/label';
import { propertyTypes } from '@/types';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Image from 'next/image';
import Link from 'next/link';


// Generate a flat list of location strings for the combobox
const locationStrings = peruLocations.flatMap(region =>
  region.provinces.flatMap(province =>
    province.districts.map(district => ({
      value: `${district}, ${province.province}, ${region.region}`.toLowerCase(),
      label: `${district}, ${province.province}, ${region.region}`,
    }))
  )
);

const salePriceRanges = [
    { label: '$0 - $200k', min: 0, max: 200000 },
    { label: '$200k - $500k', min: 200000, max: 500000 },
    { label: '$500k - $1M', min: 500000, max: 1000000 },
    { label: '$1M+', min: 1000000, max: Infinity },
];

const rentPriceRanges = [
    { label: 'S/0 - S/1.5k', min: 0, max: 1500 },
    { label: 'S/1.5k - S/3k', min: 1500, max: 3000 },
    { label: 'S/3k - S/5k', min: 3000, max: 5000 },
    { label: 'S/5k+', min: 5000, max: Infinity },
];

const mapContainerStyle = {
  width: '100%',
  height: '70vh', // Increased height for better map view
  borderRadius: '0.75rem' 
};

const defaultCenter = {
  lat: -9.189967,
  lng: -75.015152
};


function LocationCombobox({ value, onChange, className }: { value: string, onChange: (value: string) => void, className?: string }) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const comboboxRef = useRef(null);

  useEffect(() => {
    const selectedLabel = locationStrings.find(l => l.value === value)?.label || '';
    setInputValue(selectedLabel);
  }, [value]);

  useClickAway(comboboxRef, () => {
    setShowSuggestions(false);
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      onChange('');
    }
  };

  const handleSuggestionSelect = (currentValue: string) => {
    const selectedLabel = locationStrings.find(l => l.value === currentValue)?.label || '';
    setInputValue(selectedLabel);
    onChange(currentValue);
    setShowSuggestions(false);
  };

  const filteredLocations = useMemo(() => {
    if (!inputValue) return [];
    const lowercasedInput = inputValue.toLowerCase();
    return locationStrings.filter(location =>
      location.label.toLowerCase().includes(lowercasedInput)
    ).slice(0, 10);
  }, [inputValue]);

  return (
    <div ref={comboboxRef} className={cn("relative w-full", className)}>
      <Command shouldFilter={false} className="overflow-visible">
         <Input
            placeholder="Buscar por Región, Provincia o Distrito..."
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            className="w-full text-sm"
          />
        {showSuggestions && inputValue && (
          <div className="absolute top-full z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
            <CommandList>
              {filteredLocations.length > 0 ? (
                <CommandGroup>
                  {filteredLocations.map((location) => (
                    <CommandItem
                      key={location.value}
                      value={location.value}
                      onSelect={handleSuggestionSelect}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === location.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {location.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No se encontró la ubicación.</CommandEmpty>
              )}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}


export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || "",
    preventGoogleFontsLoading: true,
  });

  // Filter states
  const [locationQuery, setLocationQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [bedroomsFilter, setBedroomsFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('PEN');
  
  // Map state
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const propertiesData = await getProperties();
        setProperties(propertiesData);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleModalityChange = (value: string) => {
    setModalityFilter(value);
    // Reset prices when modality changes
    setMinPrice('');
    setMaxPrice('');
    if (value === 'alquiler') {
        setPriceCurrency('PEN');
    } else {
        setPriceCurrency('USD');
    }
  }

  const priceRanges = useMemo(() => {
    if (priceCurrency === 'PEN') return rentPriceRanges;
    return salePriceRanges;
  }, [priceCurrency]);


  const filteredProperties = useMemo(() => {
    return properties
      .filter(property => {
        const propertyLocation = `${property.district || ''}, ${property.province || ''}, ${property.region || ''}`.toLowerCase();

        const locationMatch = !locationQuery || propertyLocation.includes(locationQuery);
        const modalityMatch = !modalityFilter || modalityFilter === 'all' || property.modality === modalityFilter;
        const propertyTypeMatch = !propertyTypeFilter || propertyTypeFilter === 'all' || property.propertyType === propertyTypeFilter;
        const bedroomsMatch = bedroomsFilter === 'all' || (property.bedrooms && property.bedrooms >= parseInt(bedroomsFilter));

        const minPriceNumber = minPrice ? Number(minPrice) : 0;
        const maxPriceNumber = maxPrice ? Number(maxPrice) : Infinity;

        const priceToCompare = priceCurrency === 'PEN' ? property.pricePEN : property.priceUSD;

        const minPriceMatch = priceToCompare >= minPriceNumber;
        const maxPriceMatch = priceToCompare <= maxPriceNumber;

        return locationMatch && modalityMatch && propertyTypeMatch && bedroomsMatch && minPriceMatch && maxPriceMatch;
      })
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [properties, locationQuery, modalityFilter, propertyTypeFilter, bedroomsFilter, minPrice, maxPrice, priceCurrency]);

  const handleClearFilters = () => {
    setLocationQuery('');
    setModalityFilter('all');
    setPropertyTypeFilter('all');
    setBedroomsFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setPriceCurrency('PEN');
  }

  const handlePriceRangeClick = (min: number, max: number) => {
    setMinPrice(min.toString());
    setMaxPrice(max === Infinity ? '' : max.toString());
  }
  
  const mapBounds = useMemo(() => {
    if (!isLoaded) return undefined;
    
    const bounds = new window.google.maps.LatLngBounds();
    filteredProperties.forEach(prop => {
        if (prop.location) {
            bounds.extend(new window.google.maps.LatLng(prop.location.lat, prop.location.lng));
        }
    });

    return bounds;
  }, [isLoaded, filteredProperties]);

  const priceButtonText = useMemo(() => {
    const symbol = priceCurrency === 'PEN' ? 'S/' : '$';
    if (minPrice && maxPrice) return `${symbol}${Number(minPrice).toLocaleString()} - ${symbol}${Number(maxPrice).toLocaleString()}`;
    if (minPrice) return `Desde ${symbol}${Number(minPrice).toLocaleString()}`;
    if (maxPrice) return `Hasta ${symbol}${Number(maxPrice).toLocaleString()}`;
    return 'Rango de Precio';
  }, [minPrice, maxPrice, priceCurrency]);
  
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (isLoaded && mapRef.current && mapBounds) {
        if (filteredProperties.length > 1 && !mapBounds.isEmpty()) {
            mapRef.current.fitBounds(mapBounds);
        } else if (filteredProperties.length === 1 && filteredProperties[0].location) {
            mapRef.current.setCenter(filteredProperties[0].location);
            mapRef.current.setZoom(15);
        } else {
             mapRef.current.setCenter(defaultCenter);
             mapRef.current.setZoom(5);
        }
    }
  }, [filteredProperties, mapBounds, isLoaded]);
  

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
      <Card className="p-4 md:p-6 mb-8 bg-secondary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-7 gap-4 items-end">
          <div className="lg:col-span-2 xl:col-span-2">
            <Label>Ubicación</Label>
            <LocationCombobox value={locationQuery} onChange={setLocationQuery} />
          </div>

          <div className="xl:col-span-1">
            <Label>Tipo de Operación</Label>
            <Select value={modalityFilter} onValueChange={handleModalityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Operación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="alquiler">Alquiler</SelectItem>
              </SelectContent>
            </Select>
          </div>

           <div className="xl:col-span-1">
            <Label>Tipo de Propiedad</Label>
            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Propiedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="xl:col-span-1">
             <Label>Dormitorios</Label>
             <Select value={bedroomsFilter} onValueChange={setBedroomsFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Dormitorios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2 xl:col-span-1">
            <Label>Rango de Precio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  <span className='truncate'>{priceButtonText}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-price">Precio Mín.</Label>
                      <Input id="min-price" placeholder="Mínimo" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" />
                    </div>
                    <div>
                      <Label htmlFor="max-price">Precio Máx.</Label>
                      <Input id="max-price" placeholder="Máximo" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" />
                    </div>
                  </div>
                   <div className="space-y-2">
                        <Label>Moneda</Label>
                        <Select value={priceCurrency} onValueChange={setPriceCurrency}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                <SelectItem value="USD">Dólares (USD)</SelectItem>
                            </SelectContent>
                        </Select>
                   </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium w-full">Sugerencias:</span>
                    {priceRanges.map(range => (
                        <Button key={range.label} variant="outline" size="sm" onClick={() => handlePriceRangeClick(range.min, range.max)} className="flex-grow">
                            {range.label}
                        </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="xl:col-span-1">
            <Label>Vista</Label>
             <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'map')}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list"><div className="flex items-center gap-2"><LayoutGrid className="h-4 w-4"/> Vista de Lista</div></SelectItem>
                <SelectItem value="map"><div className="flex items-center gap-2"><MapIcon className="h-4 w-4"/> Vista de Mapa</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
            <Button onClick={handleClearFilters} variant="secondary" size="sm">Limpiar Búsqueda</Button>
        </div>
      </Card>
      
      <div className="mb-4">
        <div className="text-lg font-semibold">{filteredProperties.length} propiedades encontradas</div>
      </div>

      {viewMode === 'list' && (
        <>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
                </div>
            ) : filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">No se encontraron propiedades. Intenta ajustar tu búsqueda.</p>
                </div>
            )}
        </>
      )}

      {viewMode === 'map' && (
        <div className="w-full h-[70vh]">
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={defaultCenter}
                    zoom={8}
                    options={{
                        fullscreenControl: true,
                        streetViewControl: true,
                        mapTypeControl: false,
                        zoomControl: true,
                    }}
                    onLoad={(map) => { mapRef.current = map; }}
                >
                    {filteredProperties.map(prop => (
                        prop.location && (
                            <Marker 
                                key={prop.id} 
                                position={prop.location}
                                onClick={() => setActiveMarker(prop.id)}
                            />
                        )
                    ))}

                    {activeMarker && (
                        <InfoWindow
                            position={properties.find(p => p.id === activeMarker)?.location}
                            onCloseClick={() => setActiveMarker(null)}
                        >
                            <div className="p-1 max-w-xs bg-background">
                                {(() => {
                                    const prop = properties.find(p => p.id === activeMarker);
                                    if (!prop) return null;
                                    const price = prop.modality === 'alquiler' ? prop.pricePEN : prop.priceUSD;
                                    const symbol = prop.modality === 'alquiler' ? 'S/' : '$';

                                    return (
                                        <div className="flex gap-3 items-center">
                                            {prop.imageUrls[0] && <Image src={prop.imageUrls[0]} alt={prop.title} width={80} height={80} className="rounded-md object-cover"/>}
                                            <div>
                                                <h4 className="font-bold text-sm truncate">{prop.title}</h4>
                                                <p className="text-primary font-semibold">{symbol}{Number(price).toLocaleString()}</p>
                                                <Link href={`/properties/${prop.id}`} className="text-xs text-blue-600 hover:underline">
                                                    Ver detalles
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            ) : (
                <Skeleton className="w-full h-full rounded-xl" />
            )}
        </div>
      )}
    </div>
  );
}
