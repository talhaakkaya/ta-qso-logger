import React from "react";
import { Row, Col } from "react-bootstrap";
import StatsCard from "./StatsCard";
import { useQSO } from "@/contexts/QSOContext";
import { getCurrentDateTime } from "@/utils/dateUtils";

const Dashboard: React.FC = () => {
  const { qsoRecords, filteredRecords } = useQSO();

  const getUniqueCallsigns = () => {
    const uniqueCallsigns = new Set(
      qsoRecords.map((r) => r.callsign).filter(Boolean),
    );
    return uniqueCallsigns.size;
  };

  const getTodayQSOs = () => {
    const { date: today } = getCurrentDateTime();
    return qsoRecords.filter((r) => r.datetime && r.datetime.startsWith(today))
      .length;
  };

  return (
    <Row className="g-3 mb-3">
      <Col xs={12} md={6}>
        <StatsCard
          title="Toplam QSO"
          value={qsoRecords.length}
          icon="bi-broadcast"
          color="info"
        />
      </Col>
      <Col xs={12} md={6}>
        <StatsCard
          title="Filtrelenmiş"
          value={filteredRecords.length}
          icon="bi-funnel"
          color="info"
        />
      </Col>
      <Col xs={12} md={6}>
        <StatsCard
          title="Benzersiz Çağrı İşaretleri"
          value={getUniqueCallsigns()}
          icon="bi-person-badge"
          color="info"
        />
      </Col>
      <Col xs={12} md={6}>
        <StatsCard
          title="Bugünkü QSO"
          value={getTodayQSOs()}
          icon="bi-calendar-check"
          color="info"
        />
      </Col>
    </Row>
  );
};

export default Dashboard;
