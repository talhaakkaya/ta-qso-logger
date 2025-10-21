import type { Metadata, Viewport } from "next";
import { QSOProvider } from "@/contexts/QSOContext";
import AuthSessionProvider from "@/components/Providers/SessionProvider";
import { ThemeProvider } from "@/components/Providers/ThemeProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "TA QSO Logger",
    template: "%s | TA QSO Logger",
  },
  description:
    "Web-based QSO logger for amateur radio operators. Track contacts, import/export ADIF files, view interactive maps, and manage your ham radio logbook online.",
  keywords: [
    "amateur radio",
    "ham radio",
    "QSO logger",
    "ADIF",
    "contact log",
    "radio logbook",
    "Maidenhead grid",
    "ham radio software",
  ],
  authors: [{ name: "TA1VAL" }],
  creator: "TA1VAL",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://qso-logger.example.com",
    title: "TA QSO Logger",
    description:
      "Web-based QSO logger for amateur radio operators with ADIF support and interactive maps.",
    siteName: "TA QSO Logger",
  },
  twitter: {
    card: "summary",
    title: "TA QSO Logger",
    description:
      "Track your amateur radio contacts with ADIF support and interactive world maps.",
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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          storageKey="qso-logger-theme"
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            <QSOProvider>{children}</QSOProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
