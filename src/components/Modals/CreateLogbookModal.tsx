import React, { useState } from "react";
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
import { useToast } from "@/hooks/useToast";
import { useQSO } from "@/contexts/QSOContext";
import { BookOpen, Plus, Loader2 } from "lucide-react";

interface CreateLogbookModalProps {
  show: boolean;
  onHide: () => void;
}

const CreateLogbookModal: React.FC<CreateLogbookModalProps> = ({ show, onHide }) => {
  const t = useTranslations();
  const { showToast } = useToast();
  const { createLogbook, setCurrentLogbook } = useQSO();
  const [logbookName, setLogbookName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    setLogbookName("");
    onHide();
  };

  const handleCreate = async () => {
    if (!logbookName.trim()) {
      showToast(t("validation.required.logbookName"), "warning");
      return;
    }

    setIsCreating(true);
    try {
      const newLogbook = await createLogbook(logbookName.trim());
      showToast(t("validation.success.logbookCreated", { name: logbookName.trim() }), "success");

      // Auto-select the newly created logbook
      // Pass the object directly instead of searching by ID
      await setCurrentLogbook(newLogbook);

      handleClose();
    } catch (error: any) {
      console.error("Failed to create logbook:", error);

      // Handle specific error messages
      if (error.message.includes("already exists")) {
        showToast(t("validation.error.logbookExists"), "error");
      } else if (error.message.includes("too long")) {
        showToast(t("validation.error.logbookNameTooLong"), "error");
      } else {
        showToast(t("validation.error.logbookCreateFailed"), "error");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCreating) {
      handleCreate();
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {t("modals.createLogbook.title")}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logbook-name">{t("modals.createLogbook.nameLabel")}</Label>
            <Input
              id="logbook-name"
              type="text"
              value={logbookName}
              onChange={(e) => setLogbookName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("modals.createLogbook.placeholder")}
              maxLength={100}
              disabled={isCreating}
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              {t("modals.createLogbook.helperText")}
            </p>
          </div>
        </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isCreating}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!logbookName.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("modals.createLogbook.creating")}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {t("modals.createLogbook.create")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLogbookModal;
