import React, { useState, useEffect } from "react";
import { Nav, Button } from "react-bootstrap";
import { useQSO } from "@/contexts/QSOContext";
import { useToast } from "@/hooks/useToast";
import SettingsModal from "@/components/Modals/SettingsModal";
import ImportModal from "@/components/Modals/ImportModal";
import QSOMapModal from "@/components/Modals/QSOMapModal";

interface SidebarProps {
  onShowQCodes: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onShowQCodes }) => {
  const { qsoRecords, exportToADIF } = useQSO();
  const { showToast } = useToast();
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
    <div
      className="bg-dark text-light position-relative"
      style={{
        width: isCollapsed ? "60px" : "250px",
        transition: "width 0.3s ease",
      }}
    >
      <style>{`
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
      {/* Toggle Button - hidden on mobile */}
      <div className="p-2 ps-4 border-bottom border-secondary d-none d-md-flex justify-content-between align-items-center">
        {!isCollapsed && (
          <h6 className="mb-0 text-light">
            <i className="bi bi-gear me-2"></i>
            İşlemler
          </h6>
        )}
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="border-0 text-light"
        >
          <i
            className={`bi ${isCollapsed ? "bi-chevron-right" : "bi-chevron-left"}`}
          ></i>
        </Button>
      </div>

      <Nav className="flex-column p-2">
        <Nav.Link
          onClick={handleExport}
          className="text-light py-2 px-3 mb-1 rounded d-flex align-items-center"
          style={{ cursor: "pointer" }}
          title="Dışa Aktar"
        >
          <i className="bi bi-download"></i>
          {!isCollapsed && <span className="ms-2">Dışa Aktar</span>}
        </Nav.Link>

        <Nav.Link
          onClick={() => setShowImport(true)}
          className="text-light py-2 px-3 mb-1 rounded d-flex align-items-center"
          style={{ cursor: "pointer" }}
          title="İçe Aktar"
        >
          <i className="bi bi-upload"></i>
          {!isCollapsed && <span className="ms-2">İçe Aktar</span>}
        </Nav.Link>

        <Nav.Link
          onClick={() => setShowQSOMap(true)}
          className="text-light py-2 px-3 mb-1 rounded d-flex align-items-center"
          style={{ cursor: "pointer" }}
          title="QSO Haritası"
        >
          <i className="bi bi-map"></i>
          {!isCollapsed && <span className="ms-2">QSO Haritası</span>}
        </Nav.Link>

        <Nav.Link
          onClick={() => setShowSettings(true)}
          className="text-light py-2 px-3 mb-1 rounded d-flex align-items-center"
          style={{ cursor: "pointer" }}
          title="Ayarlar"
        >
          <i className="bi bi-gear"></i>
          {!isCollapsed && <span className="ms-2">Ayarlar</span>}
        </Nav.Link>

        {!isCollapsed && <hr className="border-secondary my-2" />}

        <Nav.Link
          onClick={onShowQCodes}
          className="text-secondary py-2 px-3 mb-1 rounded d-flex align-items-center"
          style={{ cursor: "pointer" }}
          title="Q Kodları"
        >
          <i className="bi bi-question-circle"></i>
          {!isCollapsed && <span className="ms-2">Q Kodları</span>}
        </Nav.Link>
      </Nav>

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
    </div>
  );
};

export default Sidebar;
