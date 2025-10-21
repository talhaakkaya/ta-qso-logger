"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Radio, FileDown, Map, Github, Settings, Sun, Moon } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalQSOs: number;
}

export default function SignIn() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalQSOs: 0 });
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch stats from API
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-background">
      {/* Theme Toggle */}
      {mounted && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}
      {/* Hero Section */}
      <section className="py-12 shadow-md bg-white dark:bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center py-12 gap-8">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <Image src="/favicon.svg" alt="TA QSO Logo" className="w-16 h-16" width={64} height={64} />
                <h1 className="text-5xl font-bold text-foreground">TA QSO Logger</h1>
              </div>
              <p className="text-xl mb-8 text-muted-foreground">
                Amatör radyo operatörleri için modern web tabanlı QSO kayıt sistemi.
                Bağlantılarınızı yönetin, ADIF desteği ile içe/dışa aktarın ve dünya
                haritasında görüntüleyin.
              </p>
              <Button
                size="lg"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="px-6"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google ile Giriş Yap
              </Button>
            </div>
            <div className="lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-purple-600 shadow-md border-0">
                  <CardContent className="text-center p-6">
                    <h2 className="text-5xl font-bold text-white mb-2">
                      {stats.totalUsers.toLocaleString("tr-TR")}
                    </h2>
                    <p className="text-white/90">Kullanıcı</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 shadow-md border-0">
                  <CardContent className="text-center p-6">
                    <h2 className="text-5xl font-bold text-white mb-2">
                      {stats.totalQSOs.toLocaleString("tr-TR")}
                    </h2>
                    <p className="text-white/90">QSO Kaydı</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-[#f8f8f8] dark:bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold mb-12 text-foreground">Özellikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="h-full bg-white dark:bg-card shadow-sm border-border">
              <CardContent className="text-center p-6">
                <div className="mb-4 flex justify-center">
                  <Radio className="w-12 h-12 text-primary" />
                </div>
                <h5 className="text-xl font-semibold mb-3 text-foreground">QSO Yönetimi</h5>
                <p className="text-muted-foreground">
                  Amatör radyo bağlantı kayıtlarınızı oluşturun, düzenleyin ve silin.
                </p>
              </CardContent>
            </Card>
            <Card className="h-full bg-white dark:bg-card shadow-sm border-border">
              <CardContent className="text-center p-6">
                <div className="mb-4 flex justify-center">
                  <FileDown className="w-12 h-12 text-green-600" />
                </div>
                <h5 className="text-xl font-semibold mb-3 text-foreground">İçe/Dışa Aktarma</h5>
                <p className="text-muted-foreground">
                  ADIF (.adi) ve CSV formatlarında bağlantılarınızı içe ve dışa aktarın.
                </p>
              </CardContent>
            </Card>
            <Card className="h-full bg-white dark:bg-card shadow-sm border-border">
              <CardContent className="text-center p-6">
                <div className="mb-4 flex justify-center">
                  <Map className="w-12 h-12 text-cyan-600" />
                </div>
                <h5 className="text-xl font-semibold mb-3 text-foreground">İnteraktif Haritalar</h5>
                <p className="text-muted-foreground">
                  Tüm bağlantılarınızı Leaflet ile dünya haritasında görüntüleyin.
                </p>
              </CardContent>
            </Card>
            <Card className="h-full bg-white dark:bg-card shadow-sm border-border">
              <CardContent className="text-center p-6">
                <div className="mb-4 flex justify-center">
                  <Settings className="w-12 h-12 text-orange-600" />
                </div>
                <h5 className="text-xl font-semibold mb-3 text-foreground">Basit & Gelişmiş Mod</h5>
                <p className="text-muted-foreground">
                  Yeni başlayanlar için basit, deneyimli operatörler için gelişmiş mod.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-white dark:bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground mb-6 flex items-center justify-center gap-2">
              <Github className="w-5 h-5" />
              <a
                href="https://github.com/talhaakkaya/ta-qso-logger"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
            </p>
            <p className="text-muted-foreground mb-6">73! İyi QSO&apos;lar!</p>
            <p className="text-xs text-muted-foreground">
              <a
                href="https://www.qrz.com/db/TA1TLA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                TA1TLA
              </a>
              &apos;nin QSO Logger&apos;ından ilham alınarak{" "}
              <a
                href="https://www.qrz.com/db/TA1VAL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                TA1VAL
              </a>
              {" "}tarafından geliştirilmiştir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
