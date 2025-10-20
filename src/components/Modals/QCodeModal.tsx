import React, { useState, useMemo } from "react";
import { Modal, Table, Form, InputGroup } from "react-bootstrap";

interface QCodeModalProps {
  show: boolean;
  onHide: () => void;
}

const qCodes = [
  { code: "QRA", meaning: "İstasyon adı nedir?" },
  { code: "QRB", meaning: "İstasyonunuz ne kadar uzakta?" },
  { code: "QRG", meaning: "Tam frekansımı söyler misiniz?" },
  { code: "QRH", meaning: "Frekansım değişiyor mu?" },
  { code: "QRI", meaning: "Gönderme tonunuz nasıl?" },
  { code: "QRJ", meaning: "Sinyallerim zayıf mı?" },
  { code: "QRK", meaning: "Sinyallerimin anlaşılırlığı nasıl?" },
  { code: "QRL", meaning: "Meşgul müsünüz?" },
  { code: "QRM", meaning: "Parazit/enterferans alıyor musunuz?" },
  { code: "QRN", meaning: "Atmosferik parazit var mı?" },
  { code: "QRO", meaning: "Gücümü artırayım mı?" },
  { code: "QRP", meaning: "Gücümü azaltayım mı?" },
  { code: "QRQ", meaning: "Daha hızlı göndereyim mi?" },
  { code: "QRS", meaning: "Daha yavaş göndereyim mi?" },
  { code: "QRT", meaning: "Göndermeyi durdurayım mı?" },
  { code: "QRU", meaning: "Benim için mesajınız var mı?" },
  { code: "QRV", meaning: "Hazır mısınız?" },
  { code: "QRW", meaning: "... ile haberleşeceğimi bildireyim mi?" },
  { code: "QRX", meaning: "Tekrar ne zaman arayacaksınız?" },
  { code: "QRY", meaning: "Sıram kaç?" },
  { code: "QRZ", meaning: "Beni kim arıyor?" },
  { code: "QSA", meaning: "Sinyallerim kuvveti nedir?" },
  { code: "QSB", meaning: "Sinyallerim fading yapıyor mu?" },
  { code: "QSD", meaning: "Telgrafım kusurlu mu?" },
  { code: "QSG", meaning: "Telgrafları toplu göndereyim mi?" },
  { code: "QSK", meaning: "Araya girebilir miyim?" },
  { code: "QSL", meaning: "Alındığını onaylar mısınız?" },
  { code: "QSM", meaning: "Son telgrafı tekrar eder misiniz?" },
  { code: "QSN", meaning: "Beni duyabildiniz mi?" },
  { code: "QSO", meaning: "Direkt haberleşebilir misiniz?" },
  { code: "QSP", meaning: "... ya iletin" },
  { code: "QSQ", meaning: "Doktor/tıbbi yardım var mı?" },
  { code: "QST", meaning: "Genel çağrı" },
  { code: "QSU", meaning: "Bu frekansta göndereyim mi?" },
  { code: "QSV", meaning: "Ayar için V harfi göndereyim mi?" },
  { code: "QSW", meaning: "Bu frekansta gönderecek misiniz?" },
  { code: "QSX", meaning: "... frekansı dinliyorum" },
  { code: "QSY", meaning: "Başka frekansa geçeyim mi?" },
  { code: "QSZ", meaning: "Her kelimeyi tekrar edeyim mi?" },
  { code: "QTA", meaning: "Son telgrafı iptal edin" },
  { code: "QTC", meaning: "Kaç mesajınız var?" },
  { code: "QTH", meaning: "Konumunuz nedir?" },
  { code: "QTR", meaning: "Tam saat kaç?" },
  { code: "QTU", meaning: "Çalışma saatleri nedir?" },
  { code: "QTX", meaning: "Başka bildirim olana kadar açık tutun" },
  { code: "QUA", meaning: "... haberlerim var" },
];

const QCodeModal: React.FC<QCodeModalProps> = ({ show, onHide }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQCodes = useMemo(() => {
    if (!searchTerm) return qCodes;
    return qCodes.filter(
      (qCode) =>
        qCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qCode.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>
          <i className="bi bi-question-circle me-2"></i>Q Kodları Referansı
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Q kodu veya anlamında ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Form.Group>
        <Table hover responsive>
          <thead className="table-dark sticky-top">
            <tr>
              <th style={{ width: "100px" }}>Q Kodu</th>
              <th>Anlamı</th>
            </tr>
          </thead>
          <tbody>
            {filteredQCodes.map((qCode) => (
              <tr key={qCode.code}>
                <td>
                  <span className="badge bg-primary">{qCode.code}</span>
                </td>
                <td>{qCode.meaning}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default QCodeModal;
