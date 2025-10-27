"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useEffect, useState } from "react";
import { type Locale, defaultLocale } from "@/i18n";
import { getStoredLocale, saveLocale } from "@/utils/localeUtils";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load initial locale and messages
  useEffect(() => {
    const storedLocale = getStoredLocale();

    // Load messages for the stored locale
    import(`../../../messages/${storedLocale}.json`)
      .then((module) => {
        setMessages(module.default);
        setLocaleState(storedLocale);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load messages:", error);
        setIsLoading(false);
      });
  }, []);

  // Update document title when locale changes
  useEffect(() => {
    if (locale === "tr") {
      document.title = "TA QSO Logger - Amatör Radyo QSO Logger";
    } else {
      document.title = "TA QSO Logger - Amateur Radio QSO Logger";
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setIsLoading(true);
    saveLocale(newLocale);

    // Load messages for the new locale
    import(`../../../messages/${newLocale}.json`)
      .then((module) => {
        setMessages(module.default);
        setLocaleState(newLocale);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load messages:", error);
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
