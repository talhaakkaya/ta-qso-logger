"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { formatNumber } from "@/utils/stringUtils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatsModalProps {
  show: boolean;
  onHide: () => void;
}

interface FrequencyData {
  freq: string;
  count: number;
}

interface StatsData {
  totalUsers: number;
  totalQSOs: number;
  topFrequencies: FrequencyData[];
}

const StatsModal: React.FC<StatsModalProps> = ({ show, onHide }) => {
  const t = useTranslations();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (show) {
      setLoading(true);
      fetch("/api/stats")
        .then((res) => res.json())
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch stats:", err);
          setLoading(false);
        });
    }
  }, [show]);

  const isDark = theme === "dark";

  const chartData = {
    labels: stats?.topFrequencies.map((item) => `${item.freq} MHz`) || [],
    datasets: [
      {
        label: t("modals.stats.chartLabel"),
        data: stats?.topFrequencies.map((item) => item.count) || [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.x} QSO`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
      },
      y: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
      },
    },
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 />
            {t("modals.stats.frequencyStats")}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t("modals.stats.totalUsers")}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {formatNumber(stats?.totalUsers || 0)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t("modals.stats.totalQSO")}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {formatNumber(stats?.totalQSOs || 0)}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">{t("modals.stats.topFrequencies")}</h3>
              <div className="h-[300px] sm:h-[400px] md:h-[500px]">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default StatsModal;
