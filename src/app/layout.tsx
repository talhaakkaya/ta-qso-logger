import type { Metadata, Viewport } from "next";
import AuthSessionProvider from "@/components/Providers/SessionProvider";
import { ThemeProvider } from "@/components/Providers/ThemeProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "TA QSO Logger - Amatör Radyo QSO Logger",
    template: "%s | TA QSO Logger",
  },
  description: "ADIF desteği ile amatör radyo QSO logger",
  keywords: [
    "amatör radyo",
    "QSO logger",
    "ADIF",
    "telsiz",
    "iletişim kaydı",
    "ham radio",
    "amateur radio",
    "radio logbook",
  ],
  authors: [{ name: "TA1VAL" }],
  creator: "TA1VAL",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://qso-logger.example.com",
    title: "TA QSO Logger - Amatör Radyo QSO Logger",
    description: "ADIF desteği ile amatör radyo QSO logger",
    siteName: "TA QSO Logger",
  },
  twitter: {
    card: "summary",
    title: "TA QSO Logger - Amatör Radyo QSO Logger",
    description: "ADIF desteği ile amatör radyo QSO logger",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          storageKey="qso-logger-theme"
          disableTransitionOnChange
        >
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
