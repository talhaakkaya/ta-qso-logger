import React from "react";
import StatsCard from "./StatsCard";
import { useQSO } from "@/contexts/QSOContext";
import { getCurrentDateTime } from "@/utils/dateUtils";
import { Radio, Filter, IdCard, CalendarCheck } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <StatsCard
        title="Toplam QSO"
        value={qsoRecords.length}
        icon={Radio}
        color="blue"
      />
      <StatsCard
        title="Filtrelenmiş"
        value={filteredRecords.length}
        icon={Filter}
        color="purple"
      />
      <StatsCard
        title="Benzersiz Çağrı İşaretleri"
        value={getUniqueCallsigns()}
        icon={IdCard}
        color="green"
      />
      <StatsCard
        title="Bugünkü QSO"
        value={getTodayQSOs()}
        icon={CalendarCheck}
        color="orange"
      />
    </div>
  );
};

export default Dashboard;
