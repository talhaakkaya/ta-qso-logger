"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-1 p-1">
        <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(value) => {
        if (value) setTheme(value);
      }}
      className="grid grid-cols-3 gap-1 p-1"
    >
      <ToggleGroupItem
        value="light"
        aria-label="Light theme"
        className="flex flex-col items-center gap-1 px-2 py-1.5 text-xs"
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">Açık</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dark"
        aria-label="Dark theme"
        className="flex flex-col items-center gap-1 px-2 py-1.5 text-xs"
      >
        <Moon className="h-4 w-4" />
        <span className="hidden sm:inline">Koyu</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="system"
        aria-label="System theme"
        className="flex flex-col items-center gap-1 px-2 py-1.5 text-xs"
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">Sistem</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
