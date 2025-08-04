
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import type { Property } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getProperties } from '@/services/properties';
import { Skeleton } from '@/components/ui/skeleton';
import { peruLocations } from '@/lib/peru-locations';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useClickAway } from 'react-use';


// Generate a flat list of location strings for the combobox
const locationStrings = peruLocations.flatMap(region =>
  region.provinces.flatMap(province =>
    province.districts.map(district => ({
      value: `${district}, ${province.province}, ${region.region}`.toLowerCase(),
      label: `${district}, ${province.province}, ${region.region}`,
    }))
  )
);

function LocationCombobox({ value, onChange, className }: { value: string, onChange: (value: string) => void, className?: string }) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const comboboxRef = useRef(null);

  useEffect(() => {
    // Sync outside value with inside input
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
      onChange(''); // Clear filter if input is empty
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
    ).slice(0, 10); // Limit suggestions for performance
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
  const [modalityFilter, setModalityFilter] = useState('');
  
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

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const propertyLocation = `${property.district || ''}, ${property.province || ''}, ${property.region || ''}`.toLowerCase();
      
      const locationMatch = !locationQuery || propertyLocation.includes(locationQuery);
      const modalityMatch = !modalityFilter || property.modality === modalityFilter;

      return locationMatch && modalityMatch;
    });
  }, [properties, locationQuery, modalityFilter]);
  
  const handleClearFilters = () => {
    setLocationQuery('');
    setModalityFilter('');
  }

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold font-headline mb-4">Nuestras Propiedades</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Explora nuestra colección de propiedades exclusivas y encuentra tu próximo hogar.
        </p>
      </div>

      <Card className="p-4 md:p-6 mb-8 bg-secondary">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2 lg:col-span-2">
            <LocationCombobox value={locationQuery} onChange={setLocationQuery} />
          </div>
          <Select value={modalityFilter} onValueChange={setModalityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Operación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venta">Venta</SelectItem>
              <SelectItem value="alquiler">Alquiler</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={handleClearFilters}>Limpiar Búsqueda</Button>
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
