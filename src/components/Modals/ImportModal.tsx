"use client";
import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
  const { showToast } = useToast();
  const { importFromADIF, logbooks, currentLogbook, setCurrentLogbook } = useQSO();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLogbookId, setSelectedLogbookId] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    skipped?: number;
    failed?: number;
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
        showToast(t("validation.invalid.adifFile"), "error");
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showToast(t("validation.required.file"), "warning");
      return;
    }

    if (!selectedLogbookId) {
      showToast(t("validation.required.logbook"), "warning");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importFromADIF(selectedFile, selectedLogbookId);
      setImportResult(result);

      if (result.success) {
        // Switch to the imported logbook if it's different from current
        if (result.imported > 0 && selectedLogbookId && selectedLogbookId !== currentLogbook?.id) {
          await setCurrentLogbook(selectedLogbookId);
        }
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportResult({
        success: false,
        imported: 0,
        failed: 1,
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
            {t("modals.import.title")}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>{t("modals.import.selectFile")}</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".adi,.adif"
              onChange={handleFileSelect}
              disabled={isImporting}
            />
            <p className="text-sm text-muted-foreground">
              {t("modals.import.supportedFormats")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("modals.import.targetLogbook")}</Label>
            <Select
              value={selectedLogbookId}
              onValueChange={setSelectedLogbookId}
              disabled={isImporting}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <SelectValue placeholder={t("modals.import.selectLogbook")} />
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
              {t("modals.import.recordsWillBeImported")}
            </p>
          </div>

          {selectedFile && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                {t("modals.import.selectedFile")} <strong>{selectedFile.name}</strong> (
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
                    {importResult.success ? t("modals.import.success") : t("modals.import.error")}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t("modals.import.imported")} <strong>{importResult.imported}</strong> {t("modals.import.records")}
                  </div>
                  {importResult.skipped !== undefined && importResult.skipped > 0 && (
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      {t("modals.import.skipped")} <strong>{importResult.skipped}</strong> {t("modals.import.duplicates")}
                    </div>
                  )}
                  {importResult.failed !== undefined && importResult.failed > 0 && (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {t("modals.import.failed")} <strong>{importResult.failed}</strong> {t("modals.import.records")}
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
            {importResult?.success ? t("common.close") : t("common.cancel")}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || !selectedLogbookId || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("modals.import.importing")}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-1" />
                {t("modals.import.import")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
