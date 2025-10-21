import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQSO } from "@/contexts/QSOContext";
import { Filter, Search, X, XCircle } from "lucide-react";

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

  const handleYearChange = (year: string | undefined) => {
    setFilters({ year: year || "" });
  };

  const handleMonthChange = (month: string | undefined) => {
    setFilters({ month: month || "" });
  };

  const handleSearchChange = (searchTerm: string) => {
    setFilters({ searchTerm });
  };

  const hasActiveFilters = filters.year || filters.month || filters.searchTerm;

  return (
    <Card className="mb-4 border shadow-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="mb-0 flex items-center gap-2 text-lg font-semibold">
            <Filter className="w-5 h-5" />
            Filtreler
          </h5>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Temizle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Yıl</Label>
              <Select value={filters.year || undefined} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Yıllar" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Ay</Label>
              <Select value={filters.month || undefined} onValueChange={handleMonthChange} disabled={!filters.year}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Aylar" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Genel Arama</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tüm alanlarda ara..."
                  value={filters.searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.year && (
              <Badge className="flex items-center gap-2 px-3 py-1">
                Filtre: {filters.year}
                <button
                  onClick={() => setFilters({ year: "" })}
                  aria-label="Yıl filtresini temizle"
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.month && (
              <Badge className="flex items-center gap-2 px-3 py-1">
                Filtre: {months.find((m) => m.value === filters.month)?.label}
                <button
                  onClick={() => setFilters({ month: "" })}
                  aria-label="Ay filtresini temizle"
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.searchTerm && (
              <Badge className="flex items-center gap-2 px-3 py-1">
                Arama: {filters.searchTerm}
                <button
                  onClick={() => setFilters({ searchTerm: "" })}
                  aria-label="Aramayı temizle"
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterSection;
