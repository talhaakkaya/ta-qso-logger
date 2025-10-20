import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <p className="small mb-1 text-secondary">
              <i className="bi bi-broadcast-pin me-2"></i>
              <a
                href="https://www.qrz.com/db/TA1TLA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-decoration-none hover-opacity"
              >
                TA1TLA
              </a>
              &apos;nin QSO Logger&apos;ından ilham alınmıştır
            </p>
            <p className="small mb-0 text-secondary">
              <i className="bi bi-code-slash me-2"></i>
              <a
                href="https://www.qrz.com/db/TA1VAL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-decoration-none hover-opacity"
              >
                TA1VAL
              </a>{" "}
              tarafından geliştirilmektedir
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="small mb-1 text-secondary">
              <a
                href="https://github.com/talhaakkaya/ta-qso-logger"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-decoration-none hover-opacity"
              >
                <i className="bi bi-github me-2"></i>
                GitHub
              </a>
            </p>
            <p className="small mb-0 text-secondary">
              <i className="bi bi-heart-fill me-1" style={{ color: '#dc3545' }}></i>
              Open Source - GPL-3.0
            </p>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center">
            <p className="small mb-0" style={{ color: '#6c757d', fontSize: '0.85rem' }}>
              73! İyi QSO&apos;lar!
            </p>
          </Col>
        </Row>
      </Container>
      <style jsx>{`
        .hover-opacity:hover {
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
