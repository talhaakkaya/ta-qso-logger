import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Modal, Form, Button, Row, Col, InputGroup, ListGroup, Spinner } from "react-bootstrap";
import { QSORecord } from "@/types";
import { formatDateTimeForInput, getCurrentDateTimeString } from "@/utils/dateUtils";
import { getDefaultTxPower, getStoredTimezone, formatDateTimeForDisplay } from "@/utils/settingsUtils";
import { coordinatesToGridSquare, gridSquareToCoordinates } from "@/utils/gridSquareUtils";
import { useToast } from "@/hooks/useToast";

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

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

const QSOModal: React.FC<QSOModalProps> = ({
  show,
  onHide,
  record,
  onSave,
}) => {
  const { showToast } = useToast();

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

  // Location search state
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationResults, setLocationResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
      }
      setErrors({});
      // Set unique map key to force new map instance when modal opens
      setMapKey(`map-${record?.id || Date.now()}`);
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
    if (formData.qth && formData.qth.trim()) {
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
      setLocationSearchQuery("");
      setLocationResults([]);
      // Reset map state to ensure clean unmount
      setMapCoordinates(null);
      onHide();
    }
  };

  // Location search handlers
  const handleLocationSearch = async () => {
    if (!locationSearchQuery.trim()) {
      showToast("Lütfen bir konum girin", "warning");
      return;
    }

    setIsSearching(true);
    setLocationResults([]);

    try {
      // Nominatim API endpoint
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.append("q", locationSearchQuery);
      url.searchParams.append("format", "json");
      url.searchParams.append("limit", "10");
      url.searchParams.append("addressdetails", "1");

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "QSO Logger/1.0",
        },
      });

      if (!response.ok) {
        throw new Error("Konum araması başarısız oldu");
      }

      const results: NominatimResult[] = await response.json();

      if (results.length === 0) {
        showToast("Konum bulunamadı", "info");
      }

      setLocationResults(results);
    } catch (error) {
      console.error("Location search error:", error);
      showToast("Konum araması sırasında hata oluştu", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (result: NominatimResult) => {
    try {
      // Convert coordinates to grid square
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
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
      setLocationSearchQuery("");
      setLocationResults([]);
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
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>
          <i
            className={`bi ${isEditMode ? "bi-pencil-square" : "bi-plus-circle"} me-2`}
          ></i>
          {isEditMode ? "QSO Düzenle" : "Yeni QSO"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Tarih/Saat <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formatDateTimeForInput(formData.datetime)}
                  onChange={(e) => handleFieldChange("datetime", e.target.value)}
                  isInvalid={!!errors.datetime}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.datetime}
                </Form.Control.Feedback>
                {formData.datetime && (
                  <Form.Text className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    {getStoredTimezone().label}: {formatDateTimeForDisplay(formData.datetime)}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Çağrı İşareti <span className="text-danger">*</span>
                </Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="text"
                    value={formData.callsign}
                    onChange={(e) =>
                      handleFieldChange("callsign", e.target.value)
                    }
                    onBlur={(e) =>
                      handleFieldChange("callsign", e.target.value.toUpperCase())
                    }
                    placeholder="TA1ABC"
                    isInvalid={!!errors.callsign}
                    style={{ flex: 1 }}
                  />
                  {formData.callsign && (
                    <a
                      href={`https://www.qrz.com/db/${formData.callsign}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                      title="QRZ.com'da görüntüle"
                    >
                      <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                  )}
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.callsign}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>İsim</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Ahmet"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Frekans (MHz)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.001"
                  value={formData.freq || ""}
                  onChange={(e) =>
                    handleFieldChange("freq", parseFloat(e.target.value) || 0)
                  }
                  placeholder="439.200"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Grid Square</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={formData.qth}
                    onChange={(e) => handleFieldChange("qth", e.target.value)}
                    onBlur={(e) =>
                      handleFieldChange("qth", e.target.value.toUpperCase())
                    }
                    placeholder="JO01aa"
                    maxLength={10}
                    isInvalid={!!errors.qth}
                    className="flex-grow-1"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowLocationSearch(!showLocationSearch)}
                    title="Konum ara"
                    style={{ minWidth: "40px" }}
                  >
                    <i className="bi bi-geo-alt"></i>
                  </Button>
                </div>
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors.qth}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Collapsible Location Search Panel - Full Width */}
          {showLocationSearch && (
            <Row>
              <Col xs={12}>
                <div className="mb-3 p-3 border rounded bg-dark">
                  <small className="text-muted d-block mb-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Konum ara ve otomatik grid square doldur
                  </small>
                  <InputGroup className="mb-2">
                    <Form.Control
                      placeholder="Konum girin (örn: Istanbul Turkey)"
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleLocationSearch();
                        }
                      }}
                      disabled={isSearching}
                    />
                    <Button
                      variant="primary"
                      onClick={handleLocationSearch}
                      disabled={isSearching || !locationSearchQuery.trim()}
                    >
                      {isSearching ? (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        <i className="bi bi-search"></i>
                      )}
                    </Button>
                  </InputGroup>

                  {/* Results Dropdown */}
                  {locationResults.length > 0 && (
                    <ListGroup className="mt-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {locationResults.map((result) => (
                        <ListGroup.Item
                          key={result.place_id}
                          action
                          onClick={() => handleLocationSelect(result)}
                          className="py-2"
                          style={{ cursor: "pointer" }}
                        >
                          <div className="d-flex align-items-start">
                            <i className="bi bi-geo-alt-fill text-primary me-2 mt-1"></i>
                            <div className="flex-grow-1">
                              <small className="d-block">{result.display_name}</small>
                              <small className="text-muted">
                                {result.type} • {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                              </small>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Mod</Form.Label>
                <Form.Select
                  value={formData.mode}
                  onChange={(e) => handleFieldChange("mode", e.target.value)}
                >
                  <option value="">Seçiniz...</option>
                  <option value="FM">FM</option>
                  <option value="SSB">SSB</option>
                  <option value="USB">USB</option>
                  <option value="LSB">LSB</option>
                  <option value="CW">CW</option>
                  <option value="AM">AM</option>
                  <option value="DMR">DMR</option>
                  <option value="D-STAR">D-STAR</option>
                  <option value="C4FM">C4FM</option>
                  <option value="FT8">FT8</option>
                  <option value="FT4">FT4</option>
                  <option value="PSK31">PSK31</option>
                  <option value="RTTY">RTTY</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Güç (W)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={formData.txPower || ""}
                  onChange={(e) =>
                    handleFieldChange("txPower", parseFloat(e.target.value) || 0)
                  }
                  placeholder="5"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Gönderilen RST</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.rstSent}
                  onChange={(e) => handleFieldChange("rstSent", e.target.value)}
                  placeholder="59"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Alınan RST</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.rstReceived}
                  onChange={(e) => handleFieldChange("rstReceived", e.target.value)}
                  placeholder="59"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Notlar</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  placeholder="Ek notlar..."
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Map Display - Show if grid square exists */}
          {mapCoordinates && show && (
            <Row key={mapKey}>
              <Col xs={12}>
                <div className="mb-3">
                  <Form.Label className="d-flex align-items-center gap-2">
                    <i className="bi bi-map"></i>
                    Konum Haritası
                    <small className="text-muted">({formData.qth})</small>
                  </Form.Label>
                  <div key={`map-container-${mapKey}`} className="border rounded overflow-hidden" style={{ height: '450px' }}>
                    <LeafletMap
                      latitude={mapCoordinates.lat}
                      longitude={mapCoordinates.lon}
                      onLocationChange={handleMapLocationChange}
                      height="450px"
                      zoom={10}
                    />
                  </div>
                  <div className="p-2 bg-dark text-center">
                    <small className="text-muted">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                      {mapCoordinates.lat.toFixed(4)}°, {mapCoordinates.lon.toFixed(4)}°
                      <span className="mx-2">•</span>
                      <i className="bi bi-cursor-fill me-1"></i>
                      Haritayı sürükleyerek konumu değiştirebilirsiniz
                    </small>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
          İptal
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Kaydediliyor...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-1"></i>
              Kaydet
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QSOModal;
