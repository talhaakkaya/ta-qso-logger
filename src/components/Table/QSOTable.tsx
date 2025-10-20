import React, { useState } from "react";
import { Card, Table, Spinner } from "react-bootstrap";
import { useQSO } from "@/contexts/QSOContext";
import { useToast } from "@/hooks/useToast";
import QSORow from "./QSORow";
import QSOPagination from "./QSOPagination";
import QSOModal from "@/components/Modals/QSOModal";
import { QSORecord } from "@/types";
import { ROWS_PER_PAGE } from "@/utils/constants";

const QSOTable: React.FC = () => {
  const {
    filteredRecords,
    pagination,
    isLoading,
    createQSORecordImmediate,
    updateQSORecordImmediate,
  } = useQSO();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<QSORecord | null>(null);

  const startIndex = (pagination.currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  const handleOpenAddModal = () => {
    setSelectedRecord(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (record: QSORecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const handleSave = async (data: Omit<QSORecord, "id"> | QSORecord) => {
    try {
      if ("id" in data) {
        // Edit mode
        await updateQSORecordImmediate(data.id, data);
        showToast("QSO kaydı güncellendi", "success");
      } else {
        // Create mode
        await createQSORecordImmediate(data);
        showToast("QSO kaydı oluşturuldu", "success");
      }
    } catch (error) {
      console.error("Failed to save QSO:", error);
      showToast("QSO kaydı kaydedilirken hata oluştu", "error");
      throw error;
    }
  };

  return (
    <>
      <Card className="mb-3">
        <Card.Header className="text-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>
            QSO Kayıtları
          </h5>
          <button
            className="btn btn-sm btn-light"
            onClick={handleOpenAddModal}
            title="Yeni QSO Ekle"
          >
            <i className="bi bi-plus-circle me-1"></i>
            Yeni QSO
          </button>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  {/* Expand indicator column - visible only on mobile */}
                  <th className="text-center d-table-cell d-sm-none" style={{ width: "40px" }}>
                    <i className="bi bi-chevron-expand"></i>
                  </th>

                  {/* Index column */}
                  <th className="text-center" style={{ width: "60px" }}>#</th>

                  <th>Tarih/Saat</th>
                  <th>Çağrı İşareti</th>
                  <th className="d-none d-lg-table-cell">İsim</th>
                  <th className="d-none d-xl-table-cell">Frekans</th>
                  <th className="d-none d-xl-table-cell">Mod</th>
                  <th className="d-none d-xl-table-cell">Güç</th>
                  <th className="d-none d-xl-table-cell">RST Gön.</th>
                  <th className="d-none d-xl-table-cell">RST Alı.</th>
                  <th className="d-none d-xl-table-cell">Grid Square</th>
                  <th className="d-none d-xl-table-cell">Notlar</th>

                  {/* Actions column - hidden on mobile */}
                  <th className="text-center d-none d-sm-table-cell">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (isLoading)
                    return (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-4 text-muted d-table-cell d-sm-none"
                        >
                          <Spinner animation="border" variant="light" />
                        </td>
                        <td
                          colSpan={4}
                          className="text-center py-4 text-muted d-none d-sm-table-cell d-lg-none"
                        >
                          <Spinner animation="border" variant="light" />
                        </td>
                        <td
                          colSpan={5}
                          className="text-center py-4 text-muted d-none d-lg-table-cell d-xl-none"
                        >
                          <Spinner animation="border" variant="light" />
                        </td>
                        <td
                          colSpan={12}
                          className="text-center py-4 text-muted d-none d-xl-table-cell"
                        >
                          <Spinner animation="border" variant="light" />
                        </td>
                      </tr>
                    );

                  if (paginatedRecords.length === 0)
                    return (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-4 text-muted d-table-cell d-sm-none"
                        >
                          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                          Henüz QSO kaydı bulunmuyor
                        </td>
                        <td
                          colSpan={4}
                          className="text-center py-4 text-muted d-none d-sm-table-cell d-lg-none"
                        >
                          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                          Henüz QSO kaydı bulunmuyor
                        </td>
                        <td
                          colSpan={5}
                          className="text-center py-4 text-muted d-none d-lg-table-cell d-xl-none"
                        >
                          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                          Henüz QSO kaydı bulunmuyor
                        </td>
                        <td
                          colSpan={12}
                          className="text-center py-4 text-muted d-none d-xl-table-cell"
                        >
                          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                          Henüz QSO kaydı bulunmuyor
                        </td>
                      </tr>
                    );

                  return paginatedRecords.map((record, index) => (
                    <QSORow
                      key={record.id}
                      record={record}
                      index={startIndex + index + 1}
                      onEdit={handleOpenEditModal}
                    />
                  ));
                })()}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {filteredRecords.length > ROWS_PER_PAGE && <QSOPagination />}

      <QSOModal
        show={showModal}
        onHide={handleCloseModal}
        record={selectedRecord}
        onSave={handleSave}
      />
    </>
  );
};

export default QSOTable;
