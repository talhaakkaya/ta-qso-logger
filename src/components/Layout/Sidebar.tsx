import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQSO } from "@/contexts/QSOContext";
import { useToast } from "@/hooks/useToast";
import { useUserMode } from "@/hooks/useUserMode";
import SettingsModal from "@/components/Modals/SettingsModal";
import ImportModal from "@/components/Modals/ImportModal";
import QSOMapModal from "@/components/Modals/QSOMapModal";
import { Download, Upload, Map, Settings, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onShowQCodes: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onShowQCodes }) => {
  const { qsoRecords, exportToADIF } = useQSO();
  const { showToast } = useToast();
  const userMode = useUserMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showQSOMap, setShowQSOMap] = useState(false);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleExport = () => {
    if (qsoRecords.length === 0) {
      showToast("Dışa aktarılacak kayıt bulunmuyor", "warning");
      return;
    }
    exportToADIF();
    showToast("QSO kayıtları ADIF olarak dışa aktarıldı", "success");
  };

  return (
    <>
      {/* Mobile Horizontal Navbar (< 768px) */}
      <div className="md:hidden bg-card border-b">
        <nav className="flex flex-row flex-nowrap justify-evenly px-2 py-3 overflow-x-auto">
          <button
            onClick={handleExport}
            className="text-foreground px-4 py-2 hover:bg-accent active:bg-accent/80 flex flex-col items-center min-w-[64px] cursor-pointer transition-colors"
            title="Dışa Aktar"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowImport(true)}
            className="text-foreground px-4 py-2 hover:bg-accent active:bg-accent/80 flex flex-col items-center min-w-[64px] cursor-pointer transition-colors"
            title="İçe Aktar"
          >
            <Upload className="w-5 h-5" />
          </button>

          {userMode === 'advanced' && (
            <button
              onClick={() => setShowQSOMap(true)}
              className="text-foreground px-4 py-2 hover:bg-accent active:bg-accent/80 flex flex-col items-center min-w-[64px] cursor-pointer transition-colors"
              title="QSO Haritası"
            >
              <Map className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="text-foreground px-4 py-2 hover:bg-accent active:bg-accent/80 flex flex-col items-center min-w-[64px] cursor-pointer transition-colors"
            title="Ayarlar"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={onShowQCodes}
            className="text-muted-foreground px-4 py-2 hover:bg-accent hover:text-foreground active:bg-accent/80 flex flex-col items-center min-w-[64px] cursor-pointer transition-all"
            title="Q Kodları"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </nav>
      </div>

      {/* Desktop Vertical Sidebar (≥ 768px) */}
      <div
        className="hidden md:flex flex-col bg-card border-r relative transition-all duration-300 ease-in-out"
        style={{
          width: isCollapsed ? "60px" : "250px",
        }}
      >
      {/* Toggle Button - hidden on mobile */}
      <div className="p-2 pl-4 border-b hidden md:flex justify-between items-center">
        {!isCollapsed && (
          <h6 className="mb-0 text-foreground flex items-center gap-2 font-semibold">
            <Settings className="w-4 h-4" />
            İşlemler
          </h6>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="border-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex flex-col p-2">
        <button
          onClick={handleExport}
          className="text-foreground py-2 px-3 mb-1 flex items-center hover:bg-accent cursor-pointer transition-colors"
          title="Dışa Aktar"
        >
          <Download className="w-5 h-5" />
          {!isCollapsed && <span className="ml-2">Dışa Aktar</span>}
        </button>

        <button
          onClick={() => setShowImport(true)}
          className="text-foreground py-2 px-3 mb-1 flex items-center hover:bg-accent cursor-pointer transition-colors"
          title="İçe Aktar"
        >
          <Upload className="w-5 h-5" />
          {!isCollapsed && <span className="ml-2">İçe Aktar</span>}
        </button>

        {userMode === 'advanced' && (
          <button
            onClick={() => setShowQSOMap(true)}
            className="text-foreground py-2 px-3 mb-1 flex items-center hover:bg-accent cursor-pointer transition-colors"
            title="QSO Haritası"
          >
            <Map className="w-5 h-5" />
            {!isCollapsed && <span className="ml-2">QSO Haritası</span>}
          </button>
        )}

        <button
          onClick={() => setShowSettings(true)}
          className="text-foreground py-2 px-3 mb-1 flex items-center hover:bg-accent cursor-pointer transition-colors"
          title="Ayarlar"
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span className="ml-2">Ayarlar</span>}
        </button>

        {!isCollapsed && <hr className="border-border my-2" />}

        <button
          onClick={onShowQCodes}
          className="text-muted-foreground py-2 px-3 mb-1 flex items-center hover:bg-accent hover:text-foreground cursor-pointer transition-all"
          title="Q Kodları"
        >
          <HelpCircle className="w-5 h-5" />
          {!isCollapsed && <span className="ml-2">Q Kodları</span>}
        </button>
      </nav>

      </div>

      {/* Modals - shared between mobile and desktop */}
      <SettingsModal
        show={showSettings}
        onHide={() => setShowSettings(false)}
      />

      <ImportModal
        show={showImport}
        onHide={() => setShowImport(false)}
      />

      <QSOMapModal
        show={showQSOMap}
        onHide={() => setShowQSOMap(false)}
      />
    </>
  );
};

export default Sidebar;
