"use client";

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import Dashboard from "@/components/Dashboard/Dashboard";
import FilterSection from "@/components/Filters/FilterSection";
import QSOTable from "@/components/Table/QSOTable";
import QCodeModal from "@/components/Modals/QCodeModal";
import SettingsModal from "@/components/Modals/SettingsModal";
import ImportModal from "@/components/Modals/ImportModal";
import CSVImportModal from "@/components/Modals/CSVImportModal";
import QSOMapModal from "@/components/Modals/QSOMapModal";
import CreateLogbookModal from "@/components/Modals/CreateLogbookModal";
import StatsModal from "@/components/Modals/StatsModal";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { useSwipeToOpenSidebar } from "@/hooks/useSwipeToOpenSidebar";

// Wrapper component to enable swipe gesture inside SidebarProvider context
function SwipeGestureHandler({ children }: { children: React.ReactNode }) {
  useSwipeToOpenSidebar();
  return <>{children}</>;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showQCodeModal, setShowQCodeModal] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);
  const [showCSVImport, setShowCSVImport] = React.useState(false);
  const [showQSOMap, setShowQSOMap] = React.useState(false);
  const [showCreateLogbook, setShowCreateLogbook] = React.useState(false);
  const [showStats, setShowStats] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-foreground animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider>
      <SwipeGestureHandler>
        <AppSidebar
          onShowSettings={() => setShowSettings(true)}
          onShowImport={() => setShowImport(true)}
          onShowCSVImport={() => setShowCSVImport(true)}
          onShowQSOMap={() => setShowQSOMap(true)}
          onShowQCodes={() => setShowQCodeModal(true)}
          onShowCreateLogbook={() => setShowCreateLogbook(true)}
          onShowStats={() => setShowStats(true)}
        />
        <SidebarInset>
          <Header />
          <main className="flex-1 flex flex-col gap-4 p-4">
            <Dashboard />
            <FilterSection />
            <QSOTable />
          </main>
          <Footer />
        </SidebarInset>

      <QCodeModal
        show={showQCodeModal}
        onHide={() => setShowQCodeModal(false)}
      />
      <SettingsModal
        show={showSettings}
        onHide={() => setShowSettings(false)}
      />
      <ImportModal
        show={showImport}
        onHide={() => setShowImport(false)}
      />
      <CSVImportModal
        show={showCSVImport}
        onHide={() => setShowCSVImport(false)}
      />
      <QSOMapModal
        show={showQSOMap}
        onHide={() => setShowQSOMap(false)}
      />
      <CreateLogbookModal
        show={showCreateLogbook}
        onHide={() => setShowCreateLogbook(false)}
      />
      <StatsModal
        show={showStats}
        onHide={() => setShowStats(false)}
      />

      <Toaster position="top-right" richColors />
      </SwipeGestureHandler>
    </SidebarProvider>
  );
}
