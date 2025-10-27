/**
 * DeleteConfirmDialog Component
 * Reusable delete confirmation dialog for QSO records
 * Eliminates duplication across QSOTable and QSORow
 */

import React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
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
  const t = useTranslations();

  return (
    <Dialog open={show} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" />
            {t("modals.deleteConfirm.title")}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("modals.deleteConfirm.message")}
            </p>
            {record && (
              <div className="rounded-md bg-muted p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t("modals.deleteConfirm.callsignLabel")}</span>
                  <strong className="text-sm">{record.callsign}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t("modals.deleteConfirm.dateLabel")}</span>
                  <span className="text-sm">{formatDateTimeForDisplay(record.datetime)}</span>
                </div>
              </div>
            )}
            <p className="text-xs text-destructive">
              {t("modals.deleteConfirm.warning")}
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin" />
                {t("common.deleting")}
              </>
            ) : (
              <>
                <Trash2 />
                {t("common.delete")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
