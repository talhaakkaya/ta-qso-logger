import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { useToast } from "@/hooks/useToast";
import { useQSO } from "@/contexts/QSOContext";
import {
  TIMEZONE_OPTIONS,
  getUserSettings,
  saveUserSettings,
  UserSettings,
} from "@/utils/settingsUtils";

interface SettingsModalProps {
  show: boolean;
  onHide: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onHide }) => {
  const { showToast } = useToast();
  const { deleteAllQSORecords } = useQSO();
  const [settings, setSettings] = useState<UserSettings>({
    timezone: TIMEZONE_OPTIONS[0],
    stationCallsign: "",
    defaultTxPower: 5,
  });
  const [originalTimezone, setOriginalTimezone] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load current settings when modal opens
  useEffect(() => {
    if (show) {
      const currentSettings = getUserSettings();
      setSettings(currentSettings);
      setOriginalTimezone(currentSettings.timezone.value);
    }
  }, [show]);

  const handleSave = () => {
    try {
      const timezoneChanged = settings.timezone.value !== originalTimezone;
      saveUserSettings(settings);
      showToast("Ayarlar kaydedildi", "success");
      onHide();

      // Reload page if timezone changed to update all displayed times
      if (timezoneChanged) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Ayarlar kaydedilirken hata oluştu", "error");
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
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>
          <i className="bi bi-gear me-2"></i>
          Ayarlar
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-broadcast me-2"></i>
              İstasyon Çağrı İşareti
            </Form.Label>
            <Form.Control
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
            />
            <Form.Text className="text-muted">
              ADIF dışa aktarımlarında kullanılacak istasyon çağrı işaretiniz.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-lightning-charge me-2"></i>
              Varsayılan Güç (W)
            </Form.Label>
            <Form.Control
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
            <Form.Text className="text-muted">
              Yeni QSO kayıtları için varsayılan verici gücü.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-globe me-2"></i>
              Saat Dilimi
            </Form.Label>
            <Form.Select
              value={settings.timezone.value}
              onChange={(e) => {
                const selectedTz = TIMEZONE_OPTIONS.find(
                  (tz) => tz.value === e.target.value,
                );
                if (selectedTz) {
                  setSettings((prev) => ({ ...prev, timezone: selectedTz }));
                }
              }}
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Tüm kayıtlar UTC olarak saklanır, seçilen saat dilimine göre görüntülenir.
            </Form.Text>
          </Form.Group>

          <hr className="my-4" />

          {/* Danger Zone */}
          <div className="border border-danger rounded p-3">
            <h6 className="text-danger mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Tehlikeli Bölge
            </h6>
            {!showDeleteConfirm ? (
              <>
                <p className="text-muted small mb-3">
                  Tüm QSO kayıtlarınızı kalıcı olarak silin. Bu işlem geri alınamaz!
                </p>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <i className="bi bi-trash me-1"></i>
                  Tüm QSO Kayıtlarını Sil
                </Button>
              </>
            ) : (
              <Alert variant="danger" className="mb-0">
                <Alert.Heading className="h6">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Emin misiniz?
                </Alert.Heading>
                <p className="small mb-3">
                  Bu işlem <strong>tüm QSO kayıtlarınızı</strong> kalıcı olarak silecektir.
                  Bu işlem geri alınamaz ve verileriniz kurtarılamaz!
                </p>
                <div className="d-flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    İptal
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Siliniyor...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash-fill me-1"></i>
                        Evet, Tüm Kayıtları Sil
                      </>
                    )}
                  </Button>
                </div>
              </Alert>
            )}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          İptal
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <i className="bi bi-check-circle me-1"></i>
          Kaydet
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;
