"use client";

import React from "react";
import { Container, Spinner } from "react-bootstrap";
import { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import Sidebar from "@/components/Layout/Sidebar";
import Dashboard from "@/components/Dashboard/Dashboard";
import FilterSection from "@/components/Filters/FilterSection";
import QSOTable from "@/components/Table/QSOTable";
import QCodeModal from "@/components/Modals/QCodeModal";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showQCodeModal, setShowQCodeModal] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="d-flex flex-grow-1">
        <Sidebar onShowQCodes={() => setShowQCodeModal(true)} />
        <div className="flex-grow-1">
          <Container fluid className="py-3 px-2 px-md-3">
            <Dashboard />
            <FilterSection />
            <QSOTable />
          </Container>
        </div>
      </div>
      <Footer />

      <QCodeModal
        show={showQCodeModal}
        onHide={() => setShowQCodeModal(false)}
      />

      <Toaster position="top-right" />
    </div>
  );
}
