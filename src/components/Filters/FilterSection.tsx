import React from "react";
import { Card, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { useQSO } from "@/contexts/QSOContext";

const FilterSection: React.FC = () => {
  const { filters, setFilters, clearFilters, qsoRecords } = useQSO();

  const years = React.useMemo(() => {
    const yearSet = new Set<string>();
    qsoRecords.forEach((record) => {
      if (record.datetime) {
        yearSet.add(record.datetime.split("-")[0]);
      }
    });
    return Array.from(yearSet).sort().reverse();
  }, [qsoRecords]);

  const months = [
    { value: "01", label: "Ocak" },
    { value: "02", label: "Şubat" },
    { value: "03", label: "Mart" },
    { value: "04", label: "Nisan" },
    { value: "05", label: "Mayıs" },
    { value: "06", label: "Haziran" },
    { value: "07", label: "Temmuz" },
    { value: "08", label: "Ağustos" },
    { value: "09", label: "Eylül" },
    { value: "10", label: "Ekim" },
    { value: "11", label: "Kasım" },
    { value: "12", label: "Aralık" },
  ];

  const handleYearChange = (year: string) => {
    setFilters({ year });
  };

  const handleMonthChange = (month: string) => {
    setFilters({ month });
  };

  const handleSearchChange = (searchTerm: string) => {
    setFilters({ searchTerm });
  };

  const hasActiveFilters = filters.year || filters.month || filters.searchTerm;

  return (
    <Card className="mb-3 border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtreler
          </h5>
          {hasActiveFilters && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={clearFilters}
            >
              <i className="bi bi-x-circle me-1"></i>
              Temizle
            </Button>
          )}
        </div>

        <Row className="g-3">
          <Col xs={12} md={3}>
            <Form.Group>
              <Form.Label className="small text-muted">Yıl</Form.Label>
              <Form.Select
                value={filters.year}
                onChange={(e) => handleYearChange(e.target.value)}
              >
                <option value="">Tüm Yıllar</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={3}>
            <Form.Group>
              <Form.Label className="small text-muted">Ay</Form.Label>
              <Form.Select
                value={filters.month}
                onChange={(e) => handleMonthChange(e.target.value)}
                disabled={!filters.year}
              >
                <option value="">Tüm Aylar</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small text-muted">Genel Arama</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tüm alanlarda ara..."
                  value={filters.searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        {hasActiveFilters && (
          <div className="mt-3 d-flex flex-wrap gap-2">
            {filters.year && (
              <span className="badge bg-primary d-flex align-items-center gap-2">
                Filtre: {filters.year}
                <button
                  className="btn-close"
                  onClick={() => setFilters({ year: "" })}
                  aria-label="Yıl filtresini temizle"
                ></button>
              </span>
            )}
            {filters.month && (
              <span className="badge bg-primary d-flex align-items-center gap-2">
                Filtre: {months.find((m) => m.value === filters.month)?.label}
                <button
                  className="btn-close"
                  onClick={() => setFilters({ month: "" })}
                  aria-label="Ay filtresini temizle"
                ></button>
              </span>
            )}
            {filters.searchTerm && (
              <span className="badge bg-primary d-flex align-items-center gap-2">
                Arama: {filters.searchTerm}
                <button
                  className="btn-close"
                  onClick={() => setFilters({ searchTerm: "" })}
                  aria-label="Aramayı temizle"
                ></button>
              </span>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FilterSection;
