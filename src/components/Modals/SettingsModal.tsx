"use client";

import React, { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/useToast";
import { useQSO } from "@/contexts/QSOContext";
import { useProfile, useUpdateProfile, useSettings, useUpdateSettings } from "@/hooks/useQSOQueries";
import {
  TIMEZONE_OPTIONS,
  UserSettings,
} from "@/utils/settingsUtils";
import { toCallsignCase } from "@/utils/stringUtils";
import { Settings, Trash2, Check, Loader2 } from "lucide-react";

interface SettingsModalProps {
  show: boolean;
  onHide: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onHide }) => {
  const t = useTranslations();
  const { showToast } = useToast();
  const { deleteAllQSORecords } = useQSO();
  const { data: profileData } = useProfile();
  const { data: settingsData } = useSettings();
  const updateProfileMutation = useUpdateProfile();
  const updateSettingsMutation = useUpdateSettings();
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
    if (show && settingsData) {
      const currentSettings: UserSettings = {
        timezone: settingsData.timezone,
        stationCallsign: profileData?.callsign || "",
        gridSquare: profileData?.gridSquare || "",
        defaultTxPower: settingsData.defaultTxPower,
        mode: settingsData.mode,
      };

      setSettings(currentSettings);
    }
  }, [show, profileData, settingsData]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save UI-only settings using mutation (will invalidate cache and trigger re-renders)
      await updateSettingsMutation.mutateAsync({
        timezone: settings.timezone,
        defaultTxPower: settings.defaultTxPower,
        mode: settings.mode,
      });

      // Save callsign and grid square to database using mutation
      // This will automatically invalidate cache and update all components
      await updateProfileMutation.mutateAsync({
        callsign: settings.stationCallsign,
        gridSquare: settings.gridSquare,
      });

      showToast(t("validation.success.settingsSaved"), "success");
      onHide();
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast(t("validation.error.settingsSaveFailed"), "error");
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
      showToast(t("validation.success.recordsDeleted", { count: deletedCount }), "success");
      setShowDeleteConfirm(false);
      onHide();
    } catch (error) {
      console.error("Failed to delete all QSO records:", error);
      showToast(t("validation.error.deleteAllFailed"), "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings />
            {t("modals.settings.title")}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
        <div className="space-y-6">
          {/* Station Callsign */}
          <div className="space-y-2">
            <Label>{t("modals.settings.stationCallsign")}</Label>
            <Input
              type="text"
              value={settings.stationCallsign}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  stationCallsign: toCallsignCase(e.target.value),
                }))
              }
              placeholder={t("qso.placeholders.callsign")}
              maxLength={15}
              disabled={isLoading}
            />
          </div>

          {/* Grid Square */}
          <div className="space-y-2">
            <Label>{t("modals.settings.gridSquare")}</Label>
            <Input
              type="text"
              value={settings.gridSquare}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  gridSquare: toCallsignCase(e.target.value),
                }))
              }
              placeholder={t("qso.placeholders.gridSquare")}
              maxLength={8}
              disabled={isLoading}
            />
          </div>

          {/* Default Power */}
          <div className="space-y-2">
            <Label>{t("modals.settings.defaultPower")}</Label>
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
              placeholder={t("qso.placeholders.power")}
            />
          </div>

          {/* User Mode */}
          <div className="space-y-2">
            <Label>{t("modals.settings.usageMode")}</Label>
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
                  {t("modals.settings.simpleMode")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="mode-advanced" />
                <Label htmlFor="mode-advanced" className="cursor-pointer font-normal">
                  {t("modals.settings.advancedMode")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label>{t("modals.settings.timezone")}</Label>
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
            <Label className="text-destructive">{t("modals.settings.deleteAllRecords")}</Label>
            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive w-full"
              >
                <Trash2 />
                {t("modals.settings.deleteAllButton")}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("modals.settings.deleteWarning")}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    {t("common.cancel")}
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
                        {t("common.deleting")}
                      </>
                    ) : (
                      <>
                        <Trash2 />
                        {t("modals.settings.confirmDelete")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                {t("common.saving")}
              </>
            ) : (
              <>
                <Check />
                {t("common.save")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
