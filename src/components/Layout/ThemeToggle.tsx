"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2 p-2">
        <div className="h-6 w-11 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 p-2">
      <Sun className={`h-4 w-4 transition-colors ${!isDark ? "text-amber-500" : "text-muted-foreground"}`} />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Toggle theme"
      />
      <Moon className={`h-4 w-4 transition-colors ${isDark ? "text-blue-400" : "text-muted-foreground"}`} />
    </div>
  );
}
