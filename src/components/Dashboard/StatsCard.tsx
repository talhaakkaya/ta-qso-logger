import React from "react";
import { Card } from "react-bootstrap";

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: "primary" | "info" | "success" | "warning" | "danger";
}

const colorMap = {
  primary: {
    bg: "rgba(102, 126, 234, 0.15)",
    iconColor: "#667eea",
  },
  info: {
    bg: "rgba(13, 110, 253, 0.15)",
    iconColor: "#0d6efd",
  },
  success: {
    bg: "rgba(16, 185, 129, 0.15)",
    iconColor: "#10b981",
  },
  warning: {
    bg: "rgba(251, 191, 36, 0.15)",
    iconColor: "#fbbf24",
  },
  danger: {
    bg: "rgba(239, 68, 68, 0.15)",
    iconColor: "#ef4444",
  },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const { bg, iconColor } = colorMap[color];

  return (
    <Card className="border-0 h-100 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div className="flex-grow-1">
          <h6 className="text-muted mb-2 small text-uppercase fw-semibold">
            {title}
          </h6>
          <h3 className="mb-0 fw-bold fs-2">
            {value.toLocaleString("tr-TR")}
          </h3>
        </div>
        <div
          className="d-flex align-items-center justify-content-center rounded"
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
          }}
        >
          <i className={`${icon} fs-2 text-muted opacity-50`}></i>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;
