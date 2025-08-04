
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import type { Property } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getProperties } from '@/services/properties';
import { Skeleton } from '@/components/ui/skeleton';
import { peruLocations } from '@/lib/peru-locations';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useClickAway } from 'react-use';
import { Label } from '@/components/ui/label';


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

  // Filter states
  const [locationQuery, setLocationQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [bedroomsFilter, setBedroomsFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
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
  }

  const priceRanges = useMemo(() => {
    return modalityFilter === 'alquiler' ? rentPriceRanges : salePriceRanges;
  }, [modalityFilter]);


  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const propertyLocation = `${property.district || ''}, ${property.province || ''}, ${property.region || ''}`.toLowerCase();
      
      const locationMatch = !locationQuery || propertyLocation.includes(locationQuery);
      const modalityMatch = !modalityFilter || modalityFilter === 'all' || property.modality === modalityFilter;
      const bedroomsMatch = bedroomsFilter === 'all' || (property.bedrooms && property.bedrooms >= parseInt(bedroomsFilter));
      
      // Price filtering with currency conversion
      const priceInUSD = property.currency === 'USD' 
        ? Number(property.price) 
        : Number(property.price) / property.exchangeRate;

      const filterCurrency = modalityFilter === 'alquiler' ? 'PEN' : 'USD';

      const minPriceNumber = minPrice ? Number(minPrice) : 0;
      const maxPriceNumber = maxPrice ? Number(maxPrice) : Infinity;

      let priceToCompare = priceInUSD;
      if (filterCurrency === 'PEN') {
        // This is an approximation for filtering UI. The exchange rate on the property is the source of truth.
        priceToCompare = priceInUSD * 3.75; 
      }

      const minPriceMatch = priceToCompare >= minPriceNumber;
      const maxPriceMatch = priceToCompare <= maxPriceNumber;


      return locationMatch && modalityMatch && bedroomsMatch && minPriceMatch && maxPriceMatch;
    });
  }, [properties, locationQuery, modalityFilter, bedroomsFilter, minPrice, maxPrice]);
  
  const handleClearFilters = () => {
    setLocationQuery('');
    setModalityFilter('all');
    setBedroomsFilter('all');
    setMinPrice('');
    setMaxPrice('');
  }

  const handlePriceRangeClick = (min: number, max: number) => {
    setMinPrice(min.toString());
    setMaxPrice(max === Infinity ? '' : max.toString());
  }

  const priceButtonText = useMemo(() => {
    const symbol = modalityFilter === 'alquiler' ? 'S/' : '$';
    if (minPrice && maxPrice) return `${symbol}${Number(minPrice).toLocaleString()} - ${symbol}${Number(maxPrice).toLocaleString()}`;
    if (minPrice) return `Desde ${symbol}${Number(minPrice).toLocaleString()}`;
    if (maxPrice) return `Hasta ${symbol}${Number(maxPrice).toLocaleString()}`;
    return 'Rango de Precio';
  }, [minPrice, maxPrice, modalityFilter]);

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold font-headline mb-4">Nuestras Propiedades</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Explora nuestra colección de propiedades exclusivas y encuentra tu próximo hogar.
        </p>
      </div>

      <Card className="p-4 md:p-6 mb-8 bg-secondary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <Label>Ubicación</Label>
            <LocationCombobox value={locationQuery} onChange={setLocationQuery} />
          </div>

          <div>
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
          
          <div>
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

          <div>
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
        </div>
        <div className="mt-6 flex justify-end">
            <Button onClick={handleClearFilters} variant="secondary" size="sm">Limpiar Búsqueda</Button>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-56 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
         <div className="text-center py-16">
            <p className="text-muted-foreground">No se encontraron propiedades. Intenta ajustar tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
