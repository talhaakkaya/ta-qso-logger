import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/useToast";
import { useQSO } from "@/contexts/QSOContext";
import {
  TIMEZONE_OPTIONS,
  getUserSettings,
  saveUserSettings,
  UserSettings,
} from "@/utils/settingsUtils";
import { Settings, Trash2, Check, Loader2 } from "lucide-react";

interface SettingsModalProps {
  show: boolean;
  onHide: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onHide }) => {
  const { showToast } = useToast();
  const { deleteAllQSORecords, loadUserProfile } = useQSO();
  const [settings, setSettings] = useState<UserSettings>({
    timezone: TIMEZONE_OPTIONS[0],
    stationCallsign: "",
    gridSquare: "",
    defaultTxPower: 5,
    mode: "simple",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load current settings when modal opens
  useEffect(() => {
    if (show) {
      loadSettings();
    }
  }, [show]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load localStorage settings
      const currentSettings = getUserSettings();

      // Fetch profile from database to get callsign and grid square
      const response = await fetch("/api/profile");
      if (response.ok) {
        const profile = await response.json();
        // Override localStorage values with database values
        currentSettings.stationCallsign = profile.callsign || "";
        currentSettings.gridSquare = profile.gridSquare || "";
      }

      setSettings(currentSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Fall back to localStorage only
      const currentSettings = getUserSettings();
      setSettings(currentSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      saveUserSettings(settings);

      // Save callsign and grid square to database
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsign: settings.stationCallsign,
          gridSquare: settings.gridSquare,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Reload user profile in context
      await loadUserProfile();

      showToast("Ayarlar kaydedildi", "success");
      onHide();

      // Always reload page to update UI
      window.location.reload();
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Ayarlar kaydedilirken hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onHide();
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const deletedCount = await deleteAllQSORecords();
      showToast(`${deletedCount} QSO kaydı silindi`, "success");
      setShowDeleteConfirm(false);
      onHide();
      // Reload page to refresh all data
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete all QSO records:", error);
      showToast("QSO kayıtları silinirken hata oluştu", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings />
            Ayarlar
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Station Callsign */}
          <div className="space-y-2">
            <Label>İstasyon Çağrı İşareti</Label>
            <Input
              type="text"
              value={settings.stationCallsign}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  stationCallsign: e.target.value.toUpperCase(),
                }))
              }
              placeholder="TA1ABC"
              maxLength={15}
              disabled={isLoading}
            />
          </div>

          {/* Grid Square */}
          <div className="space-y-2">
            <Label>Grid Square (Maidenhead Locator)</Label>
            <Input
              type="text"
              value={settings.gridSquare}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  gridSquare: e.target.value.toUpperCase(),
                }))
              }
              placeholder="KM38ab"
              maxLength={8}
              disabled={isLoading}
            />
          </div>

          {/* Default Power */}
          <div className="space-y-2">
            <Label>Varsayılan Güç (W)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={settings.defaultTxPower || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  defaultTxPower: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="5"
            />
          </div>

          {/* User Mode */}
          <div className="space-y-2">
            <Label>Kullanım Modu</Label>
            <RadioGroup
              value={settings.mode}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, mode: value as "simple" | "advanced" }))
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="simple" id="mode-simple" />
                <Label htmlFor="mode-simple" className="cursor-pointer font-normal">
                  Basit Mod
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="mode-advanced" />
                <Label htmlFor="mode-advanced" className="cursor-pointer font-normal">
                  Gelişmiş Mod
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label>Saat Dilimi</Label>
            <Select
              value={settings.timezone.value}
              onValueChange={(value) => {
                const selectedTz = TIMEZONE_OPTIONS.find((tz) => tz.value === value);
                if (selectedTz) {
                  setSettings((prev) => ({ ...prev, timezone: selectedTz }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t space-y-2">
            <Label className="text-destructive">Tüm QSO Kayıtlarını Sil</Label>
            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive w-full"
              >
                <Trash2 />
                Tüm Kayıtları Sil
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Bu işlem geri alınamaz. Emin misiniz?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Siliniyor...
                      </>
                    ) : (
                      <>
                        <Trash2 />
                        Evet, Sil
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Check />
                Kaydet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
