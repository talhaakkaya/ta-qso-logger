"use client";

import React from "react";
import { useTranslations } from "next-intl";
import StatsCard from "./StatsCard";
import { useQSO } from "@/contexts/QSOContext";
import { getCurrentDateTime } from "@/utils/dateUtils";
import { Radio, Filter, IdCard, CalendarCheck } from "lucide-react";

const Dashboard: React.FC = () => {
  const t = useTranslations();
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <StatsCard
        title={t("qso.totalQso")}
        value={qsoRecords.length}
        icon={Radio}
        color="blue"
      />
      <StatsCard
        title={t("qso.filtered")}
        value={filteredRecords.length}
        icon={Filter}
        color="purple"
      />
      <StatsCard
        title={t("qso.uniqueCallsigns")}
        value={getUniqueCallsigns()}
        icon={IdCard}
        color="green"
      />
      <StatsCard
        title={t("qso.todayQso")}
        value={getTodayQSOs()}
        icon={CalendarCheck}
        color="orange"
      />
    </div>
  );
};

export default Dashboard;
