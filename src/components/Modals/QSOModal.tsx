import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QSORecord } from "@/types";
import { formatDateTimeForInput, getCurrentDateTimeString } from "@/utils/dateUtils";
import { getDefaultTxPower, getStoredTimezone, formatDateTimeForDisplay } from "@/utils/settingsUtils";
import { coordinatesToGridSquare, gridSquareToCoordinates } from "@/utils/gridSquareUtils";
import { useToast } from "@/hooks/useToast";
import { useUserMode } from "@/hooks/useUserMode";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import locationService from "@/services/locationService";
import { Search, MapPin, Loader2, Check, ExternalLink, Pencil, Plus, Clock } from "lucide-react";

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(
  () => import("@/components/Map/LeafletMap"),
  {
    ssr: false,
    loading: () => <div className="text-center p-4">Harita yükleniyor...</div>
  }
);

interface QSOModalProps {
  show: boolean;
  onHide: () => void;
  record: QSORecord | null;
  onSave: (data: Omit<QSORecord, "id"> | QSORecord) => Promise<void>;
}

const QSOModal: React.FC<QSOModalProps> = ({
  show,
  onHide,
  record,
  onSave,
}) => {
  const { showToast } = useToast();
  const userMode = useUserMode();
  const locationSearch = useLocationSearch();

  const [formData, setFormData] = useState<Omit<QSORecord, "id">>({
    datetime: "",
    callsign: "",
    name: "",
    freq: 0,
    mode: "FM",
    txPower: getDefaultTxPower(),
    rstSent: "",
    rstReceived: "",
    qth: "",
    notes: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Location search visibility
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  // Map display state
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [mapKey, setMapKey] = useState<string>('');

  const isEditMode = record !== null;

  // Reset form when modal opens/closes or record changes
  useEffect(() => {
    if (show) {
      if (record) {
        // Edit mode - populate with existing data
        setFormData({
          datetime: record.datetime,
          callsign: record.callsign,
          name: record.name,
          freq: record.freq,
          mode: record.mode,
          txPower: record.txPower,
          rstSent: record.rstSent,
          rstReceived: record.rstReceived,
          qth: record.qth,
          notes: record.notes,
        });

        // Set map coordinates immediately if grid square exists
        if (record.qth && record.qth.trim().length >= 4) {
          const coords = gridSquareToCoordinates(record.qth);
          setMapCoordinates(coords);
        } else {
          setMapCoordinates(null);
        }
      } else {
        // Add mode - set defaults in UTC
        const currentDateTime = getCurrentDateTimeString();
        setFormData({
          datetime: currentDateTime,
          callsign: "",
          name: "",
          freq: 0,
          mode: "FM",
          txPower: getDefaultTxPower(),
          rstSent: "",
          rstReceived: "",
          qth: "",
          notes: "",
        });
        setMapCoordinates(null);
      }
      setErrors({});
      // Set unique map key to force new map instance when modal opens
      setMapKey(`map-${record?.id || Date.now()}`);
    } else {
      // Reset map coordinates when modal closes
      setMapCoordinates(null);
    }
  }, [show, record]);

  // Update map coordinates when grid square changes
  useEffect(() => {
    if (formData.qth && formData.qth.trim().length >= 4) {
      const coords = gridSquareToCoordinates(formData.qth);
      setMapCoordinates(coords);
    } else {
      setMapCoordinates(null);
    }
  }, [formData.qth]);

  const handleFieldChange = (
    field: keyof Omit<QSORecord, "id">,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.callsign.trim()) {
      newErrors.callsign = "Çağrı işareti zorunludur";
    }

    if (!formData.datetime) {
      newErrors.datetime = "Tarih/Saat zorunludur";
    }

    // Validate Grid Square (Maidenhead locator) format if provided
    // In simple mode, accept free text. In advanced mode, validate grid square format.
    if (formData.qth && formData.qth.trim() && userMode === 'advanced') {
      const gridSquarePattern = /^[A-R]{2}[0-9]{2}([a-x]{2}([0-9]{2}([a-x]{2})?)?)?$/i;
      if (!gridSquarePattern.test(formData.qth.trim())) {
        newErrors.qth = "Geçersiz grid square formatı (örn: JO01aa)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        await onSave({ ...formData, id: record.id });
      } else {
        await onSave(formData);
      }
      onHide();
    } catch (error) {
      console.error("Failed to save QSO:", error);
      // Error will be handled by parent component with toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      // Reset location search state
      setShowLocationSearch(false);
      locationSearch.clearResults();
      // Reset map state to ensure clean unmount
      setMapCoordinates(null);
      onHide();
    }
  };

  // Location search handlers
  const handleLocationSearch = async () => {
    try {
      await locationSearch.search();
    } catch (error) {
      showToast((error as Error).message, "warning");
    }
  };

  const handleLocationSelect = (result: typeof locationSearch.results[0]) => {
    try {
      // Convert coordinates to grid square
      const { lat, lon } = locationService.getCoordinatesFromResult(result);
      const gridSquare = coordinatesToGridSquare(lat, lon);

      // Fill grid square field
      handleFieldChange("qth", gridSquare);

      // Append location to notes
      const locationNote = `Location: ${result.display_name}`;
      const currentNotes = formData.notes.trim();
      const newNotes = currentNotes
        ? `${currentNotes}\n${locationNote}`
        : locationNote;
      handleFieldChange("notes", newNotes);

      // Clear and close search
      locationSearch.clearResults();
      setShowLocationSearch(false);

      showToast("Grid square güncellendi", "success");
    } catch (error) {
      console.error("Grid square conversion error:", error);
      showToast("Grid square dönüştürülemedi", "error");
    }
  };

  // Handle map marker drag - update grid square field
  const handleMapLocationChange = useCallback((lat: number, lon: number) => {
    try {
      // Convert new coordinates to grid square
      const newGridSquare = coordinatesToGridSquare(lat, lon);

      // Update grid square field
      setFormData((prev) => ({ ...prev, qth: newGridSquare }));

      // Show success toast
      showToast(`Grid square güncellendi: ${newGridSquare}`, "success");
    } catch (error) {
      console.error("Failed to update grid square from map:", error);
      showToast("Grid square güncellenemedi", "error");
    }
  }, [showToast]);

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Pencil className="w-5 h-5" />
                QSO Düzenle
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Yeni QSO
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Tarih/Saat <span className="text-destructive">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formatDateTimeForInput(formData.datetime)}
                onChange={(e) => handleFieldChange("datetime", e.target.value)}
                className={errors.datetime ? "border-destructive" : ""}
              />
              {errors.datetime && (
                <p className="text-sm text-destructive">{errors.datetime}</p>
              )}
              {formData.datetime && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {getStoredTimezone().label}: {formatDateTimeForDisplay(formData.datetime)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Çağrı İşareti <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={formData.callsign}
                  onChange={(e) =>
                    handleFieldChange("callsign", e.target.value)
                  }
                  onBlur={(e) =>
                    handleFieldChange("callsign", e.target.value.toUpperCase())
                  }
                  placeholder="TA1ABC"
                  className={errors.callsign ? "border-destructive flex-1" : "flex-1"}
                />
                {formData.callsign && (
                  <a
                    href={`https://www.qrz.com/db/${formData.callsign}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="QRZ.com'da görüntüle"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {errors.callsign && (
                <p className="text-sm text-destructive">{errors.callsign}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-2">
              <Label>İsim</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Ahmet"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <Label>Frekans (MHz)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.freq || ""}
                onChange={(e) =>
                  handleFieldChange("freq", parseFloat(e.target.value) || 0)
                }
                placeholder="439.200"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <Label>{userMode === 'simple' ? 'QTH/Konum' : 'Grid Square'}</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={formData.qth}
                  onChange={(e) => handleFieldChange("qth", e.target.value)}
                  onBlur={(e) =>
                    handleFieldChange("qth", userMode === 'advanced' ? e.target.value.toUpperCase() : e.target.value)
                  }
                  placeholder={userMode === 'simple' ? 'Istanbul, Turkey' : 'JO01aa'}
                  maxLength={userMode === 'simple' ? 100 : 10}
                  className={`${errors.qth ? "border-destructive" : ""} flex-grow`}
                />
                {userMode === 'advanced' && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowLocationSearch(!showLocationSearch)}
                    title="Konum ara"
                  >
                    <MapPin />
                  </Button>
                )}
              </div>
              {errors.qth && (
                <p className="text-sm text-destructive">{errors.qth}</p>
              )}
            </div>
          </div>

          {/* Collapsible Location Search Panel - Full Width - Advanced Mode Only */}
          {userMode === 'advanced' && showLocationSearch && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Konum ara"
                  value={locationSearch.query}
                  onChange={(e) => locationSearch.setQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLocationSearch();
                    }
                  }}
                  disabled={locationSearch.isSearching}
                />
                <Button
                  onClick={handleLocationSearch}
                  disabled={locationSearch.isSearching || !locationSearch.query.trim()}
                >
                  {locationSearch.isSearching ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Search />
                  )}
                </Button>
              </div>

              {/* Results Dropdown */}
              {locationSearch.results.length > 0 && (
                <div className="max-h-[200px] overflow-y-auto border rounded-md">
                  {locationSearch.results.map((result) => (
                    <div
                      key={result.place_id}
                      onClick={() => handleLocationSelect(result)}
                      className="p-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                    >
                      <p className="text-sm">{result.display_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {userMode === 'advanced' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Mod</Label>
                <Select value={formData.mode || undefined} onValueChange={(value) => handleFieldChange("mode", value || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FM">FM</SelectItem>
                    <SelectItem value="SSB">SSB</SelectItem>
                    <SelectItem value="USB">USB</SelectItem>
                    <SelectItem value="LSB">LSB</SelectItem>
                    <SelectItem value="CW">CW</SelectItem>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="DMR">DMR</SelectItem>
                    <SelectItem value="D-STAR">D-STAR</SelectItem>
                    <SelectItem value="C4FM">C4FM</SelectItem>
                    <SelectItem value="FT8">FT8</SelectItem>
                    <SelectItem value="FT4">FT4</SelectItem>
                    <SelectItem value="PSK31">PSK31</SelectItem>
                    <SelectItem value="RTTY">RTTY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Güç (W)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.txPower || ""}
                  onChange={(e) =>
                    handleFieldChange("txPower", parseFloat(e.target.value) || 0)
                  }
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label>Gönderilen RST</Label>
                <Input
                  type="text"
                  value={formData.rstSent}
                  onChange={(e) => handleFieldChange("rstSent", e.target.value)}
                  placeholder="59"
                />
              </div>
              <div className="space-y-2">
                <Label>Alınan RST</Label>
                <Input
                  type="text"
                  value={formData.rstReceived}
                  onChange={(e) => handleFieldChange("rstReceived", e.target.value)}
                  placeholder="59"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notlar</Label>
            <Textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="Ek notlar..."
            />
          </div>

          {/* Map Display - Show if grid square exists - Advanced Mode Only */}
          {userMode === 'advanced' && mapCoordinates && show && (
            <div key={mapKey} className="space-y-2">
              <Label>Konum Haritası ({formData.qth})</Label>
              <div key={`map-container-${mapKey}`} className="border rounded-lg overflow-hidden" style={{ height: '200px' }}>
                <LeafletMap
                  latitude={mapCoordinates.lat}
                  longitude={mapCoordinates.lon}
                  onLocationChange={handleMapLocationChange}
                  height="200px"
                  zoom={10}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
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

export default QSOModal;
