
"use client";

import { useState, useEffect, useMemo } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import type { Property } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getProperties } from '@/services/properties';
import { Skeleton } from '@/components/ui/skeleton';
import { peruLocations } from '@/lib/peru-locations';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

// Generate a flat list of location strings for the combobox
const locationStrings = peruLocations.flatMap(region =>
  region.provinces.flatMap(province =>
    province.districts.map(district => ({
      value: `${district}, ${province.province}, ${region.region}`.toLowerCase(),
      label: `${district}, ${province.province}, ${region.region}`,
    }))
  )
);

function LocationCombobox({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground"
        >
          {value
            ? locationStrings.find((location) => location.value === value)?.label
            : "Selecciona una ubicación..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar ubicación..." />
          <CommandList>
            <CommandEmpty>No se encontró la ubicación.</CommandEmpty>
            <CommandGroup>
              {locationStrings.map((location) => (
                <CommandItem
                  key={location.value}
                  value={location.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
