"use client";

import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/Providers/LocaleProvider";
import { locales, type Locale } from "@/i18n";
import { getLocaleLabel } from "@/utils/localeUtils";

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Languages className="mr-2 h-4 w-4" />
          {getLocaleLabel(locale)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLocale(lang as Locale)}
            className={locale === lang ? "bg-accent" : ""}
          >
            {getLocaleLabel(lang as Locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
