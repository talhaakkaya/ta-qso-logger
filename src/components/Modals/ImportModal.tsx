import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/useToast";
import { useQSO } from "@/contexts/QSOContext";
import { Upload, Info, CheckCircle, XCircle, Loader2, BookOpen } from "lucide-react";

interface ImportModalProps {
  show: boolean;
  onHide: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ show, onHide }) => {
  const { showToast } = useToast();
  const { importFromADIF, logbooks, currentLogbook, setCurrentLogbook } = useQSO();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLogbookId, setSelectedLogbookId] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: number;
    errorMessages?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize selected logbook when modal opens
  React.useEffect(() => {
    if (show && currentLogbook && !selectedLogbookId) {
      setSelectedLogbookId(currentLogbook.id);
    }
  }, [show, currentLogbook, selectedLogbookId]);

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

    if (!selectedLogbookId) {
      showToast("Lütfen bir logbook seçin", "warning");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importFromADIF(selectedFile, selectedLogbookId);
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

          // Switch to the imported logbook if it's different from current
          if (selectedLogbookId && selectedLogbookId !== currentLogbook?.id) {
            await setCurrentLogbook(selectedLogbookId);
          }
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
    setSelectedLogbookId("");
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onHide();
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            ADIF İçe Aktar
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>ADIF Dosyası Seçin</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".adi,.adif"
              onChange={handleFileSelect}
              disabled={isImporting}
            />
            <p className="text-sm text-muted-foreground">
              Desteklenen formatlar: .adi, .adif (ADIF 3.1.4)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Hedef Logbook</Label>
            <Select
              value={selectedLogbookId}
              onValueChange={setSelectedLogbookId}
              disabled={isImporting}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <SelectValue placeholder="Logbook seçin" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {logbooks.map((logbook) => (
                  <SelectItem key={logbook.id} value={logbook.id}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>{logbook.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({logbook.qsoCount} QSO)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              QSO kayıtları bu logbook&apos;a aktarılacak
            </p>
          </div>

          {selectedFile && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Seçilen dosya: <strong>{selectedFile.name}</strong> (
                {(selectedFile.size / 1024).toFixed(2)} KB)
              </AlertDescription>
            </Alert>
          )}

          {importResult && (
            <Alert variant={importResult.success ? "default" : "destructive"}>
              {importResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">
                    {importResult.success ? "Başarılı!" : "Hata!"}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    İçe aktarılan: <strong>{importResult.imported}</strong> kayıt
                  </div>
                  {importResult.errors > 0 && (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Hatalı: <strong>{importResult.errors}</strong> kayıt
                    </div>
                  )}
                  {importResult.errorMessages && importResult.errorMessages.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-semibold mb-1">Hata mesajları:</div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {importResult.errorMessages.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isImporting}>
            {importResult?.success ? "Kapat" : "İptal"}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || !selectedLogbookId || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                İçe Aktarılıyor...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-1" />
                İçe Aktar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
