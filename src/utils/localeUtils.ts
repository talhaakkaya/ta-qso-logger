import { type Locale, defaultLocale, locales } from "@/i18n";

const LOCALE_STORAGE_KEY = "qso-logger-locale";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && locales.includes(stored as Locale)) {
      return stored as Locale;
    }
  } catch (error) {
    console.error("Failed to get stored locale:", error);
  }

  return defaultLocale;
}

export function saveLocale(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.error("Failed to save locale:", error);
  }
}

export function getLocaleLabel(locale: Locale): string {
  const labels: Record<Locale, string> = {
    tr: "Türkçe",
    en: "English",
  };
  return labels[locale];
}
