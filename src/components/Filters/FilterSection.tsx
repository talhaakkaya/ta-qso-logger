"use client";

import React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
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
    { value: "01", label: t("filters.months.january") },
    { value: "02", label: t("filters.months.february") },
    { value: "03", label: t("filters.months.march") },
    { value: "04", label: t("filters.months.april") },
    { value: "05", label: t("filters.months.may") },
    { value: "06", label: t("filters.months.june") },
    { value: "07", label: t("filters.months.july") },
    { value: "08", label: t("filters.months.august") },
    { value: "09", label: t("filters.months.september") },
    { value: "10", label: t("filters.months.october") },
    { value: "11", label: t("filters.months.november") },
    { value: "12", label: t("filters.months.december") },
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
            {t("filters.title")}
          </h5>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              <XCircle className="w-4 h-4 mr-1" />
              {t("common.clear")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">{t("filters.year")}</Label>
              <Select value={filters.year || undefined} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allYears")} />
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
              <Label className="text-sm text-muted-foreground">{t("filters.month")}</Label>
              <Select value={filters.month || undefined} onValueChange={handleMonthChange} disabled={!filters.year}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allMonths")} />
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
              <Label className="text-sm text-muted-foreground">{t("filters.generalSearch")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("filters.searchPlaceholder")}
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
                {t("filters.filterLabel")} {filters.year}
                <button
                  onClick={() => setFilters({ year: "" })}
                  aria-label={t("filters.aria.clearYear")}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.month && (
              <Badge className="flex items-center gap-2 px-3 py-1">
                {t("filters.filterLabel")} {months.find((m) => m.value === filters.month)?.label}
                <button
                  onClick={() => setFilters({ month: "" })}
                  aria-label={t("filters.aria.clearMonth")}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.searchTerm && (
              <Badge className="flex items-center gap-2 px-3 py-1">
                {t("filters.searchLabel")} {filters.searchTerm}
                <button
                  onClick={() => setFilters({ searchTerm: "" })}
                  aria-label={t("filters.aria.clearSearch")}
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
