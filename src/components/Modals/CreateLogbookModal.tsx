import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      showToast("Logbook adı gereklidir", "warning");
      return;
    }

    setIsCreating(true);
    try {
      const newLogbook = await createLogbook(logbookName.trim());
      showToast(`"${logbookName.trim()}" logbook'u oluşturuldu`, "success");

      // Auto-select the newly created logbook
      // Pass the object directly instead of searching by ID
      await setCurrentLogbook(newLogbook);

      handleClose();
    } catch (error: any) {
      console.error("Failed to create logbook:", error);

      // Handle specific error messages
      if (error.message.includes("already exists")) {
        showToast("Bu isimde bir logbook zaten mevcut", "error");
      } else if (error.message.includes("too long")) {
        showToast("Logbook adı çok uzun (maksimum 100 karakter)", "error");
      } else {
        showToast("Logbook oluşturulurken hata oluştu", "error");
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
            Yeni Logbook Oluştur
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="logbook-name">Logbook Adı</Label>
            <Input
              id="logbook-name"
              type="text"
              value={logbookName}
              onChange={(e) => setLogbookName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Örn: Contest 2025, POTA Aktivasyonları"
              maxLength={100}
              disabled={isCreating}
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              Logbook&apos;larınızı düzenlemek için anlamlı isimler kullanın
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isCreating}>
            İptal
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!logbookName.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Oluştur
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLogbookModal;
