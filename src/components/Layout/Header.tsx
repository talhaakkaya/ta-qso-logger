"use client";

import React from "react";
import { Navbar, Container, Dropdown } from "react-bootstrap";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const Header: React.FC = () => {
  const { data: session } = useSession();

  return (
    <Navbar
      bg="dark"
      variant="dark"
      className="py-3 mb-3"
      style={{
        zIndex: 1030,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        background: 'linear-gradient(135deg, #212529 0%, #343a40 100%)'
      }}
    >
      <Container fluid className="px-3 px-md-4">
        <Navbar.Brand className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
          <div
            className="d-flex align-items-center justify-content-center me-2"
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(13, 110, 253, 0.3)'
            }}
          >
            <i className="bi bi-broadcast" style={{ fontSize: '1.2rem', color: 'white' }}></i>
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold" style={{ fontSize: '1.1rem', lineHeight: '1.2' }}>
              TA QSO Logger
            </span>
            <small className="text-white-50" style={{ fontSize: '0.7rem', lineHeight: '1' }}>
              Amateur Radio
            </small>
          </div>
        </Navbar.Brand>

        <div className="d-flex align-items-center gap-3">
          {session?.user && (
            <>
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-light"
                  size="sm"
                  className="border-0 d-flex align-items-center px-2 py-1"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      className="rounded-circle"
                      width={28}
                      height={28}
                      style={{ border: '2px solid rgba(255, 255, 255, 0.3)' }}
                    />
                  ) : (
                    <i className="bi bi-person-circle" style={{ fontSize: '1.5rem' }}></i>
                  )}
                  <span className="d-none d-lg-inline ms-2">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <i className="bi bi-chevron-down ms-2" style={{ fontSize: '0.75rem' }}></i>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
                  <Dropdown.ItemText>
                    <div className="fw-bold">{session.user.name}</div>
                    <small className="text-muted">{session.user.email}</small>
                  </Dropdown.ItemText>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="text-danger"
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Çıkış Yap
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
