'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Modal } from 'react-bootstrap';
import { useQSO } from '@/contexts/QSOContext';

// Dynamically import QSOWorldMap to avoid SSR issues
const QSOWorldMap = dynamic(
  () => import('@/components/Map/QSOWorldMap'),
  {
    ssr: false,
    loading: () => <div className="text-center p-4">Harita yükleniyor...</div>
  }
);

interface QSOMapModalProps {
  show: boolean;
  onHide: () => void;
}

const QSOMapModal: React.FC<QSOMapModalProps> = ({ show, onHide }) => {
  const { qsoRecords } = useQSO();

  // Count records with grid squares
  const recordsWithLocation = qsoRecords.filter(
    record => record.qth && record.qth.trim().length >= 4
  );

  return (
    <Modal show={show} onHide={onHide} size="xl" fullscreen="lg-down">
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>
          <i className="bi bi-map me-2"></i>
          QSO Haritası
          <small className="ms-2 text-muted">
            ({recordsWithLocation.length} konum)
          </small>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0" style={{ height: '80vh' }}>
        {recordsWithLocation.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center text-muted">
              <i className="bi bi-geo-alt" style={{ fontSize: '3rem' }}></i>
              <p className="mt-3">Grid square bilgisi olan QSO kaydı bulunmuyor</p>
            </div>
          </div>
        ) : (
          <QSOWorldMap qsoRecords={qsoRecords} height="100%" />
        )}
      </Modal.Body>
      <Modal.Footer className="bg-dark">
        <div className="d-flex gap-2 gap-md-3 w-100 justify-content-center flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc3545' }}></div>
            <small>FM</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0d6efd' }}></div>
            <small>SSB</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#198754' }}></div>
            <small>Digital (FT8/DMR/etc)</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffc107' }}></div>
            <small>CW</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fd7e14' }}></div>
            <small>AM</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#6c757d' }}></div>
            <small>Other</small>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default QSOMapModal;
