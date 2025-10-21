import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QSORecord } from "@/types";
import { useQSO } from "@/contexts/QSOContext";
import { useToast } from "@/hooks/useToast";
import { formatDateTimeForDisplay } from "@/utils/settingsUtils";
import { ChevronRight, ChevronDown, ExternalLink, Trash2, Pencil, AlertTriangle, X, Loader2 } from "lucide-react";

interface QSORowProps {
  record: QSORecord;
  index: number;
  onEdit: (record: QSORecord) => void;
  userMode: 'simple' | 'advanced';
}

const QSORow: React.FC<QSORowProps> = ({
  record,
  index,
  onEdit,
  userMode,
}) => {
  const { deleteQSORecord } = useQSO();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteQSORecord(record.id);
      showToast("QSO kaydı silindi", "success");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("QSO kaydı silinirken hata oluştu", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowClick = () => {
    // On small screens and tablets, toggle expand instead of opening modal
    if (window.innerWidth < 992) {
      setIsExpanded(!isExpanded);
    } else {
      onEdit(record);
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      {/* Main Row */}
      <TableRow
        onClick={handleRowClick}
        className="cursor-pointer hover:bg-muted/70 transition-colors border-b"
      >
        {/* Expand indicator - visible on mobile and tablets */}
        <TableCell className="text-center table-cell lg:hidden" onClick={handleExpandToggle}>
          {isExpanded ? <ChevronDown className="w-4 h-4 mx-auto" /> : <ChevronRight className="w-4 h-4 mx-auto" />}
        </TableCell>

        {/* Index column */}
        <TableCell className="text-center text-muted-foreground">{index}</TableCell>

        <TableCell>{formatDateTimeForDisplay(record.datetime)}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <strong>{record.callsign || "-"}</strong>
            {record.callsign && (
              <a
                href={`https://www.qrz.com/db/${record.callsign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
                title="QRZ.com'da görüntüle"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </TableCell>
        <TableCell className="hidden lg:table-cell">{record.name || "-"}</TableCell>
        <TableCell className="hidden xl:table-cell">
          {record.freq ? `${parseFloat(record.freq.toString()).toFixed(3)} MHz` : "-"}
        </TableCell>
        {userMode === 'advanced' && <TableCell className="hidden xl:table-cell">{record.mode || "-"}</TableCell>}
        {userMode === 'advanced' && (
          <TableCell className="hidden xl:table-cell">
            {record.txPower ? `${record.txPower} W` : "-"}
          </TableCell>
        )}
        {userMode === 'advanced' && <TableCell className="hidden xl:table-cell">{record.rstSent || "-"}</TableCell>}
        {userMode === 'advanced' && <TableCell className="hidden xl:table-cell">{record.rstReceived || "-"}</TableCell>}
        <TableCell className="hidden xl:table-cell">{record.qth || "-"}</TableCell>
        <TableCell className="hidden xl:table-cell text-muted-foreground text-sm" title={record.notes}>
          {truncateText(record.notes, 30)}
        </TableCell>

        {/* Delete button - hidden on mobile and tablets */}
        <TableCell className="text-center hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
          <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>

      {/* Expanded Detail Row - visible on mobile and tablets when expanded */}
      {isExpanded && (
        <TableRow className="table-row lg:hidden border-b">
          <TableCell colSpan={4} className="bg-muted/30 p-0">
            <div className="p-4 text-sm">
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-4 text-muted-foreground text-xs">İsim:</div>
                <div className="col-span-8">{record.name || "-"}</div>
              </div>
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-4 text-muted-foreground text-xs">Frekans:</div>
                <div className="col-span-8">
                  {record.freq ? `${parseFloat(record.freq.toString()).toFixed(3)} MHz` : "-"}
                </div>
              </div>
              {userMode === 'advanced' && (
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-4 text-muted-foreground text-xs">Mod:</div>
                  <div className="col-span-8">{record.mode || "-"}</div>
                </div>
              )}
              {userMode === 'advanced' && (
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-4 text-muted-foreground text-xs">Güç:</div>
                  <div className="col-span-8">
                    {record.txPower ? `${record.txPower} W` : "-"}
                  </div>
                </div>
              )}
              {userMode === 'advanced' && (
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-4 text-muted-foreground text-xs">RST Gön.:</div>
                  <div className="col-span-8">{record.rstSent || "-"}</div>
                </div>
              )}
              {userMode === 'advanced' && (
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-4 text-muted-foreground text-xs">RST Alı.:</div>
                  <div className="col-span-8">{record.rstReceived || "-"}</div>
                </div>
              )}
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-4 text-muted-foreground text-xs">{userMode === 'simple' ? 'QTH:' : 'Grid Square:'}</div>
                <div className="col-span-8">{record.qth || "-"}</div>
              </div>
              <div className="grid grid-cols-12 gap-2 mb-3">
                <div className="col-span-4 text-muted-foreground text-xs">Notlar:</div>
                <div className="col-span-8">{record.notes || "-"}</div>
              </div>

              {/* Actions in expanded view */}
              <div className="flex justify-end gap-2 border-t pt-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(record);
                  }}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Düzenle
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Sil
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              QSO Kaydını Sil
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Bu QSO kaydını silmek istediğinizden emin misiniz?
            </p>
            <div className="rounded-md bg-muted p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Çağrı İşareti:</span>
                <strong className="text-sm">{record.callsign}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Tarih:</span>
                <span className="text-sm">{formatDateTimeForDisplay(record.datetime)}</span>
              </div>
            </div>
            <p className="text-xs text-destructive mt-3">
              Bu işlem geri alınamaz.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 />
                  Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QSORow;
