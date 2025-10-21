/**
 * DeleteConfirmDialog Component
 * Reusable delete confirmation dialog for QSO records
 * Eliminates duplication across QSOTable and QSORow
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { QSORecord } from "@/types";
import { formatDateTimeForDisplay } from "@/utils/settingsUtils";

interface DeleteConfirmDialogProps {
  show: boolean;
  record: QSORecord | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  show,
  record,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={show} onOpenChange={onCancel}>
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
          {record && (
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
          )}
          <p className="text-xs text-destructive mt-3">
            Bu işlem geri alınamaz.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
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
  );
};

export default DeleteConfirmDialog;
