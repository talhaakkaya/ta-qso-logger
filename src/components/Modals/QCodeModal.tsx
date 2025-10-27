"use client";
import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, HelpCircle } from "lucide-react";

interface QCodeModalProps {
  show: boolean;
  onHide: () => void;
}

// Q-code list - meanings will be translated dynamically
const qCodesList = [
  "QRA", "QRB", "QRG", "QRH", "QRI", "QRK", "QRL", "QRM", "QRN", "QRO",
  "QRP", "QRQ", "QRS", "QRT", "QRU", "QRV", "QRW", "QRX", "QRZ", "QSA",
  "QSB", "QSD", "QSG", "QSK", "QSL", "QSM", "QSN", "QSO", "QSP", "QSU",
  "QSV", "QSW", "QSX", "QSY", "QSZ", "QTA", "QTB", "QTC", "QTH", "QTI",
  "QTR", "QTS", "QTU", "QTX", "QUA", "QUC", "QUD", "QUE"
];

const QCodeModal: React.FC<QCodeModalProps> = ({ show, onHide }) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");

  // Generate Q-codes array with translated meanings
  const qCodes = useMemo(() => {
    return qCodesList.map(code => ({
      code,
      meaning: t(`qcodes.${code}`)
    }));
  }, [t]);

  const filteredQCodes = useMemo(() => {
    if (!searchTerm) return qCodes;
    return qCodes.filter(
      (qCode) =>
        qCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qCode.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, qCodes]);

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle />
            {t("modals.qcodes.title")}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("modals.qcodes.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0">
                <TableRow>
                  <TableHead className="w-[100px]">{t("modals.qcodes.headers.code")}</TableHead>
                  <TableHead>{t("modals.qcodes.headers.meaning")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQCodes.map((qCode) => (
                  <TableRow key={qCode.code}>
                    <TableCell>
                      <span className="font-semibold">{qCode.code}</span>
                    </TableCell>
                    <TableCell>{qCode.meaning}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default QCodeModal;
