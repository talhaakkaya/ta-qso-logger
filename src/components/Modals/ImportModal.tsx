import React, { useState, useRef } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { useToast } from "@/hooks/useToast";
import { useQSO } from "@/contexts/QSOContext";

interface ImportModalProps {
  show: boolean;
  onHide: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ show, onHide }) => {
  const { showToast } = useToast();
  const { importFromADIF } = useQSO();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: number;
    errorMessages?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension
      if (!file.name.endsWith(".adi") && !file.name.endsWith(".adif")) {
        showToast("Lütfen geçerli bir ADIF dosyası seçin (.adi veya .adif)", "error");
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showToast("Lütfen bir dosya seçin", "warning");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importFromADIF(selectedFile);
      setImportResult(result);

      if (result.success) {
        // Handle different scenarios
        if (result.imported === 0) {
          // No records imported (all duplicates or errors)
          if (result.errorMessages && result.errorMessages.length > 0) {
            showToast(result.errorMessages.join(", "), "warning");
          } else {
            showToast("Tüm kayıtlar tekrarlayan kayıt olarak atlandı", "warning");
          }
        } else {
          // Some records imported
          let message = `${result.imported} kayıt başarıyla içe aktarıldı`;
          if (result.errorMessages && result.errorMessages.length > 0) {
            message += `. ${result.errorMessages.join(", ")}`;
          }
          showToast(message, "success");
        }

        // Close modal after successful import
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        showToast("İçe aktarma başarısız oldu", "error");
      }
    } catch (error) {
      console.error("Import error:", error);
      showToast("İçe aktarma sırasında hata oluştu", "error");
      setImportResult({
        success: false,
        imported: 0,
        errors: 1,
        errorMessages: [(error as Error).message],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>
          <i className="bi bi-upload me-2"></i>
          ADIF İçe Aktar
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-file-earmark-text me-2"></i>
              ADIF Dosyası Seçin
            </Form.Label>
            <Form.Control
              ref={fileInputRef}
              type="file"
              accept=".adi,.adif"
              onChange={handleFileSelect}
              disabled={isImporting}
            />
            <Form.Text className="text-muted">
              Desteklenen formatlar: .adi, .adif (ADIF 3.1.4)
            </Form.Text>
          </Form.Group>

          {selectedFile && (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Seçilen dosya: <strong>{selectedFile.name}</strong> (
              {(selectedFile.size / 1024).toFixed(2)} KB)
            </Alert>
          )}

          {importResult && (
            <Alert variant={importResult.success ? "success" : "danger"}>
              <div className="mb-2">
                <strong>
                  {importResult.success ? "Başarılı!" : "Hata!"}
                </strong>
              </div>
              <div className="mb-1">
                <i className="bi bi-check-circle me-2"></i>
                İçe aktarılan: <strong>{importResult.imported}</strong> kayıt
              </div>
              {importResult.errors > 0 && (
                <div className="mb-1">
                  <i className="bi bi-x-circle me-2"></i>
                  Hatalı: <strong>{importResult.errors}</strong> kayıt
                </div>
              )}
              {importResult.errorMessages && importResult.errorMessages.length > 0 && (
                <div className="mt-2">
                  <small>
                    <strong>Hata mesajları:</strong>
                    <ul className="mb-0 mt-1">
                      {importResult.errorMessages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  </small>
                </div>
              )}
            </Alert>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isImporting}>
          {importResult?.success ? "Kapat" : "İptal"}
        </Button>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={!selectedFile || isImporting}
        >
          {isImporting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              İçe Aktarılıyor...
            </>
          ) : (
            <>
              <i className="bi bi-upload me-1"></i>
              İçe Aktar
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportModal;
