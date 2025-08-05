
"use client";
import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  HexColorPicker,
  HexColorInput,
} from "react-colorful";
import { Label } from "./label";

interface ColorPickerProps {
  hsl: string | undefined;
  onHslChange: (newHsl: string) => void;
  className?: string;
}

const colorPalette = [
  "hsl(45 53% 51%)",
  "hsl(0 0% 100%)",
  "hsl(240 10% 3.9%)",
  "hsl(240 4.8% 95.9%)",
  "hsl(240 3.8% 46.1%)",
  "hsl(0 84.2% 60.2%)",
];

// --- Conversion functions ---
function hexToHsl(hex: string): string {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslToHex(hslStr: string): string {
    const [h, s, l] = hslStr.match(/\d+/g)!.map(Number);
    const sNormalized = s / 100;
    const lNormalized = l / 100;

    const c = (1 - Math.abs(2 * lNormalized - 1)) * sNormalized;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNormalized - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }

    const toHex = (c: number) => {
        const hex = Math.round((c + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


export const ColorPicker = ({
  hsl,
  onHslChange,
  className,
}: ColorPickerProps) => {

  const hexColor = React.useMemo(() => {
    return hsl ? hslToHex(hsl) : "#000000";
  }, [hsl]);

  const handleHexChange = (newHex: string) => {
    onHslChange(hexToHsl(newHex));
  };
  
  const handlePaletteClick = (hslColor: string) => {
    onHslChange(hslColor.replace(/hsl\(|\)/g, ''));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !hsl && "text-muted-foreground",
            className
          )}
        >
          <div className="flex w-full items-center gap-2">
            {hsl ? (
              <div
                className="h-4 w-4 rounded-full border border-gray-400"
                style={{ backgroundColor: `hsl(${hsl})` }}
              />
            ) : (
              <div className="h-4 w-4 rounded-full border border-gray-400" />
            )}
            <div className="truncate flex-1">{hsl ? `hsl(${hsl})` : "Elige un color"}</div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <HexColorPicker
          color={hexColor}
          onChange={handleHexChange}
          className="w-full"
        />
        <div className="flex flex-col gap-y-2 mt-4">
          <Label>Hex</Label>
          <HexColorInput
            prefixed
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            color={hexColor}
            onChange={handleHexChange}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {colorPalette.map((c) => (
            <div
              key={c}
              style={{ background: c }}
              className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
              onClick={() => handlePaletteClick(c)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
