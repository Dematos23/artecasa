
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
  hslToHsv,
  hsvToHsl,
  colord,
  extend,
} from "react-colorful";
import hsl from "colord/plugins/hsl";
import { Label } from "./label";
import { Input } from "./input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
extend([hsl]);

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

const convertHslStringToHsl = (hslString: string) => {
  const [h, s, l] = hslString.split(" ").map((val, i) => {
    return i === 0 ? parseFloat(val) : parseFloat(val.replace("%", ""));
  });
  return { h, s, l };
};

const convertHslToHslString = (hsl: { h: number; s: number; l: number }) => {
  return `${hsl.h.toFixed(0)} ${hsl.s.toFixed(0)}% ${hsl.l.toFixed(0)}%`;
};

export const ColorPicker = ({
  hsl,
  onHslChange,
  className,
}: ColorPickerProps) => {
  const color = colord(hsl ? `hsl(${hsl})` : "#000");

  const handleHexChange = (hex: string) => {
    onHslChange(colord(hex).toHslString().replace(/hsl\(|\)/g, ""));
  };

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
            <div className="truncate flex-1">{hsl ? hsl : "Pick a color"}</div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Tabs defaultValue="hex" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="hex" className="flex-1">
              HEX
            </TabsTrigger>
            <TabsTrigger value="hsl" className="flex-1">
              HSL
            </TabsTrigger>
          </TabsList>
          <TabsContent value="hex" className="flex flex-col gap-y-4">
            <HexColorPicker
              color={color.toHex()}
              onChange={handleHexChange}
              className="w-full"
            />
            <div className="flex flex-col gap-y-2">
              <Label>Hex</Label>
              <HexColorInput
                prefixed
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  className
                )}
                color={color.toHex()}
                onChange={handleHexChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="hsl" className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label>H</Label>
              <Input
                type="number"
                value={color.toHsl().h}
                onChange={(e) => {
                  const newHsl = {
                    ...color.toHsl(),
                    h: Number(e.target.value),
                  };
                  onHslChange(convertHslToHslString(newHsl));
                }}
              />
              <Label>S</Label>
              <Input
                type="number"
                value={color.toHsl().s}
                onChange={(e) => {
                  const newHsl = {
                    ...color.toHsl(),
                    s: Number(e.target.value),
                  };
                  onHslChange(convertHslToHslString(newHsl));
                }}
              />
              <Label>L</Label>
              <Input
                type="number"
                value={color.toHsl().l}
                onChange={(e) => {
                  const newHsl = {
                    ...color.toHsl(),
                    l: Number(e.target.value),
                  };
                  onHslChange(convertHslToHslString(newHsl));
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex flex-wrap gap-2 mt-4">
          {colorPalette.map((c) => (
            <div
              key={c}
              style={{ background: c }}
              className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
              onClick={() => onHslChange(c.replace(/hsl\(|\)/g, ""))}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
