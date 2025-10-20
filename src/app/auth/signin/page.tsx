"use client";

import { signIn } from "next-auth/react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

interface Stats {
  totalUsers: number;
  totalQSOs: number;
}

export default function SignIn() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalQSOs: 0 });

  useEffect(() => {
    // Fetch stats from API
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);

  return (
    <div className="min-vh-100 bg-dark text-light">
      {/* Hero Section */}
      <section className="py-5 shadow-lg" style={{ background: "linear-gradient(135deg, #212529 0%, #343a40 100%)" }}>
        <Container>
          <Row className="align-items-center py-5">
            <Col lg={6} className="text-center text-lg-start mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">TA QSO Logger</h1>
              <p className="lead mb-4">
                Amatör radyo operatörleri için modern web tabanlı QSO kayıt sistemi.
                Bağlantılarınızı yönetin, ADIF desteği ile içe/dışa aktarın ve dünya
                haritasında görüntüleyin.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="px-4"
              >
                <i className="bi bi-google me-2"></i>
                Google ile Giriş Yap
              </Button>
            </Col>
            <Col lg={6}>
              <Row className="g-3">
                <Col xs={6}>
                  <Card className="bg-dark border-primary text-center">
                    <Card.Body>
                      <h2 className="display-4 fw-bold text-primary mb-0">
                        {stats.totalUsers.toLocaleString("tr-TR")}
                      </h2>
                      <p className="text-muted mb-0">Kullanıcı</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="bg-dark border-success text-center">
                    <Card.Body>
                      <h2 className="display-4 fw-bold text-success mb-0">
                        {stats.totalQSOs.toLocaleString("tr-TR")}
                      </h2>
                      <p className="text-muted mb-0">QSO Kaydı</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">Özellikler</h2>
          <Row className="g-4">
            <Col md={6} lg={4}>
              <Card className="h-100 bg-dark border-0">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-broadcast text-primary" style={{ fontSize: "3rem" }}></i>
                  </div>
                  <h5 className="card-title">QSO Yönetimi</h5>
                  <p className="card-text text-muted">
                    Amatör radyo bağlantı kayıtlarınızı oluşturun, düzenleyin ve silin.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="h-100 bg-dark border-0">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-file-earmark-arrow-down text-success" style={{ fontSize: "3rem" }}></i>
                  </div>
                  <h5 className="card-title">ADIF Desteği</h5>
                  <p className="card-text text-muted">
                    ADIF formatında (.adi) bağlantılarınızı içe ve dışa aktarın.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="h-100 bg-dark border-0">
                <Card.Body className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-map text-info" style={{ fontSize: "3rem" }}></i>
                  </div>
                  <h5 className="card-title">İnteraktif Haritalar</h5>
                  <p className="card-text text-muted">
                    Tüm bağlantılarınızı Leaflet ile dünya haritasında görüntüleyin.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section className="py-5 bg-dark border-top border-secondary">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h2 className="mb-4">Hakkında</h2>
              <p className="lead mb-4">
                <a
                  href="https://www.qrz.com/db/TA1TLA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none text-primary"
                >
                  TA1TLA
                </a>
                &apos;nin QSO Logger&apos;ından ilham alınarak{" "}
                <a
                  href="https://www.qrz.com/db/TA1VAL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none text-primary"
                >
                  TA1VAL
                </a>
                {" "}tarafından geliştirilmiştir.
              </p>
              <p className="text-muted mb-4">
                <i className="bi bi-github me-2"></i>
                Açık kaynak (GPL-3.0) •{" "}
                <a
                  href="https://github.com/talhaakkaya/ta-qso-logger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  GitHub
                </a>
              </p>
              <p className="text-muted">73! İyi QSO&apos;lar!</p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}
