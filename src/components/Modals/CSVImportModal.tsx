import React, { useState, useRef } from "react";
import Papa from "papaparse";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/useToast";
import { useQSO } from "@/contexts/QSOContext";
import csvService from "@/services/csvService";
import { FileSpreadsheet, Info, CheckCircle, XCircle, Loader2, ArrowRight, BookOpen } from "lucide-react";

interface CSVImportModalProps {
  show: boolean;
  onHide: () => void;
}

interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

type QSOField =
  | "callsign"
  | "datetime"
  | "date"
  | "time"
  | "name"
  | "freq"
  | "mode"
  | "txPower"
  | "rstSent"
  | "rstReceived"
  | "qth"
  | "notes"
  | "skip";

const QSO_FIELDS: { value: QSOField; label: string }[] = [
  { value: "skip", label: "(Atla)" },
  { value: "callsign", label: "Çağrı İşareti *" },
  { value: "datetime", label: "Tarih/Saat (Birleşik)" },
  { value: "date", label: "Tarih *" },
  { value: "time", label: "Saat *" },
  { value: "name", label: "İsim" },
  { value: "freq", label: "Frekans (MHz)" },
  { value: "mode", label: "Mod" },
  { value: "txPower", label: "Güç (W)" },
  { value: "rstSent", label: "RST Gönderilen" },
  { value: "rstReceived", label: "RST Alınan" },
  { value: "qth", label: "QTH/Konum" },
  { value: "notes", label: "Notlar" },
];

const CSVImportModal: React.FC<CSVImportModalProps> = ({ show, onHide }) => {
  const { showToast } = useToast();
  const { importFromCSV, logbooks, currentLogbook, setCurrentLogbook } = useQSO();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLogbookId, setSelectedLogbookId] = useState<string>("");
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, QSOField>>({});
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
      if (!file.name.endsWith(".csv")) {
        showToast("Lütfen geçerli bir CSV dosyası seçin (.csv)", "error");
        return;
      }
      setSelectedFile(file);
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length < 2) {
          showToast("CSV dosyası en az başlık ve bir veri satırı içermelidir", "error");
          return;
        }

        const headers = data[0];
        const rows = data.slice(1).filter(row => row.some(cell => cell.trim() !== ""));

        setParsedData({ headers, rows });

        // Initialize column mapping with "skip" for all
        const initialMapping: Record<string, QSOField> = {};
        headers.forEach(header => {
          initialMapping[header] = "skip";
        });
        setColumnMapping(initialMapping);

        setStep(2);
      },
      error: (error) => {
        showToast(`CSV ayrıştırma hatası: ${error.message}`, "error");
      },
    });
  };

  const handleMappingChange = (csvHeader: string, qsoField: QSOField) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvHeader]: qsoField,
    }));
  };

  const handleImport = async () => {
    if (!parsedData) return;

    if (!selectedLogbookId) {
      showToast("Lütfen bir logbook seçin", "warning");
      return;
    }

    // Validate required fields are mapped using CSV service
    const validation = csvService.validateCSVMapping(columnMapping);
    if (!validation.valid) {
      showToast(validation.message || "Geçersiz sütun eşleştirmesi", "error");
      return;
    }

    setIsImporting(true);
    setStep(3);

    try {
      const result = await importFromCSV(parsedData, columnMapping, selectedLogbookId);
      setImportResult(result);

      if (result.success) {
        if (result.imported === 0) {
          showToast(result.errorMessages?.[0] || "İçe aktarma başarısız", "warning");
        } else {
          let message = `${result.imported} kayıt başarıyla içe aktarıldı`;
          if (result.errors > 0) {
            message += `, ${result.errors} kayıt atlandı`;
          }
          showToast(message, "success");

          // Switch to the imported logbook if it's different from current
          if (selectedLogbookId && selectedLogbookId !== currentLogbook?.id) {
            await setCurrentLogbook(selectedLogbookId);
          }

          setTimeout(() => {
            handleClose();
          }, 2000);
        }
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
    setStep(1);
    setSelectedFile(null);
    setSelectedLogbookId("");
    setParsedData(null);
    setColumnMapping({});
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onHide();
  };

  const getPreviewData = () => {
    if (!parsedData) return [];
    return parsedData.rows.slice(0, 3);
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[900px] lg:max-w-[1000px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <FileSpreadsheet className="shrink-0" />
            <span>
              CSV İçe Aktar
              {step === 2 && " - Sütun Eşleştirme"}
              {step === 3 && " - Sonuç"}
            </span>
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
        <div className="space-y-6">
          {/* Step 1: File Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>CSV Dosyası Seçin</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
                <p className="text-sm text-muted-foreground">
                  Desteklenen format: .csv (UTF-8 kodlamalı)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Hedef Logbook</Label>
                <Select
                  value={selectedLogbookId}
                  onValueChange={setSelectedLogbookId}
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

              {selectedFile && parsedData && (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    <div>
                      <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </div>
                    <div className="mt-1">
                      {parsedData.headers.length} sütun, {parsedData.rows.length} satır bulundu
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 2 && parsedData && (
            <div className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Her CSV sütununu QSO alanlarıyla eşleştirin. (*) ile işaretli alanlar zorunludur.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {parsedData.headers.map((header, index) => (
                    <div key={index} className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-4 sm:items-center">
                      <Label className="font-mono text-sm bg-muted px-2 py-1 rounded break-all">
                        {header}
                      </Label>
                      <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto hidden sm:block" />
                      <Select
                        value={columnMapping[header]}
                        onValueChange={(value) => handleMappingChange(header, value as QSOField)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QSO_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Önizleme (İlk 3 Satır)</Label>
                <div className="border rounded-md overflow-auto max-h-[150px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {parsedData.headers.map((header, index) => (
                          <TableHead key={index} className="text-xs whitespace-nowrap">
                            {header}
                            <br />
                            <span className="text-muted-foreground">
                              ({QSO_FIELDS.find(f => f.value === columnMapping[header])?.label})
                            </span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPreviewData().map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="text-xs whitespace-nowrap">
                              {cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Import Results */}
          {step === 3 && importResult && (
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
                      Hatalı/Atlanan: <strong>{importResult.errors}</strong> kayıt
                    </div>
                  )}
                  {importResult.errorMessages && importResult.errorMessages.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-semibold mb-1">Mesajlar:</div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {importResult.errorMessages.slice(0, 5).map((msg, idx) => (
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
          {step === 1 && (
            <Button variant="secondary" onClick={handleClose}>
              İptal
            </Button>
          )}
          {step === 2 && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setStep(1);
                  setParsedData(null);
                  setSelectedFile(null);
                }}
              >
                Geri
              </Button>
              <Button onClick={handleImport}>
                <FileSpreadsheet />
                <span className="hidden sm:inline">İçe Aktar ({parsedData?.rows.length} kayıt)</span>
                <span className="sm:hidden">İçe Aktar</span>
              </Button>
            </>
          )}
          {step === 3 && (
            <Button onClick={handleClose}>
              Kapat
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportModal;
