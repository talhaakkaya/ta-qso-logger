import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { QSORecord } from "@/types";
import { useQSO } from "@/contexts/QSOContext";
import { useToast } from "@/hooks/useToast";
import { formatDateTimeForDisplay } from "@/utils/settingsUtils";

interface QSORowProps {
  record: QSORecord;
  index: number;
  onEdit: (record: QSORecord) => void;
}

const QSORow: React.FC<QSORowProps> = ({
  record,
  index,
  onEdit,
}) => {
  const { deleteQSORecord } = useQSO();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when deleting
    if (window.confirm("Bu QSO kaydını silmek istediğinizden emin misiniz?")) {
      try {
        await deleteQSORecord(record.id);
        showToast("QSO kaydı silindi", "success");
      } catch (error) {
        console.error("Delete failed:", error);
        showToast("QSO kaydı silinirken hata oluştu", "error");
      }
    }
  };

  const handleRowClick = () => {
    // On small screens, toggle expand instead of opening modal
    if (window.innerWidth < 576) {
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
      <tr
        onClick={handleRowClick}
        style={{ cursor: "pointer" }}
        className="align-middle"
      >
        {/* Expand indicator - visible only on mobile */}
        <td className="text-center d-table-cell d-sm-none" onClick={handleExpandToggle}>
          <i className={`bi bi-chevron-${isExpanded ? "down" : "right"}`}></i>
        </td>

        {/* Index column */}
        <td className="text-center text-muted">{index}</td>

        <td>{formatDateTimeForDisplay(record.datetime)}</td>
        <td>
          <div className="d-flex align-items-center gap-2">
            <strong>{record.callsign || "-"}</strong>
            {record.callsign && (
              <a
                href={`https://www.qrz.com/db/${record.callsign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
                title="QRZ.com'da görüntüle"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="bi bi-box-arrow-up-right small"></i>
              </a>
            )}
          </div>
        </td>
        <td className="d-none d-lg-table-cell">{record.name || "-"}</td>
        <td className="d-none d-xl-table-cell">
          {record.freq ? `${parseFloat(record.freq.toString()).toFixed(3)} MHz` : "-"}
        </td>
        <td className="d-none d-xl-table-cell">{record.mode || "-"}</td>
        <td className="d-none d-xl-table-cell">
          {record.txPower ? `${record.txPower} W` : "-"}
        </td>
        <td className="d-none d-xl-table-cell">{record.rstSent || "-"}</td>
        <td className="d-none d-xl-table-cell">{record.rstReceived || "-"}</td>
        <td className="d-none d-xl-table-cell">{record.qth || "-"}</td>
        <td className="d-none d-xl-table-cell text-muted small" title={record.notes}>
          {truncateText(record.notes, 30)}
        </td>

        {/* Delete button - hidden on mobile */}
        <td className="text-center d-none d-sm-table-cell" onClick={(e) => e.stopPropagation()}>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <i className="bi bi-trash"></i>
          </Button>
        </td>
      </tr>

      {/* Expanded Detail Row - visible only on mobile when expanded */}
      {isExpanded && (
        <tr className="d-table-row d-sm-none">
          <td colSpan={4} className="bg-dark">
            <div className="p-3" style={{ fontSize: "0.9rem" }}>
              <div className="row mb-2">
                <div className="col-4 text-muted small">İsim:</div>
                <div className="col-8">{record.name || "-"}</div>
              </div>
              <div className="row mb-2">
                <div className="col-4 text-muted small">Frekans:</div>
                <div className="col-8">
                  {record.freq ? `${parseFloat(record.freq.toString()).toFixed(3)} MHz` : "-"}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4 text-muted small">Mod:</div>
                <div className="col-8">{record.mode || "-"}</div>
              </div>
              <div className="row mb-2">
                <div className="col-4 text-muted small">Güç:</div>
                <div className="col-8">
                  {record.txPower ? `${record.txPower} W` : "-"}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4 text-muted small">RST Gön.:</div>
                <div className="col-8">{record.rstSent || "-"}</div>
              </div>
              <div className="row mb-2">
                <div className="col-4 text-muted small">RST Alı.:</div>
                <div className="col-8">{record.rstReceived || "-"}</div>
              </div>
              <div className="row mb-2">
                <div className="col-4 text-muted small">Grid Square:</div>
                <div className="col-8">{record.qth || "-"}</div>
              </div>
              <div className="row mb-3">
                <div className="col-4 text-muted small">Notlar:</div>
                <div className="col-8">{record.notes || "-"}</div>
              </div>

              {/* Actions in expanded view */}
              <div className="d-flex justify-content-end gap-2 border-top pt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(record);
                  }}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Düzenle
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <i className="bi bi-trash me-1"></i>
                  Sil
                </Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default QSORow;
