"use client";

import { ColumnDef } from "@tanstack/react-table";
import { QSORecord } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ExternalLink, Trash2, Pencil, ChevronRight, ChevronDown } from "lucide-react";
import { formatDateTimeForDisplay } from "@/utils/settingsUtils";

interface ColumnsProps {
  userMode: 'simple' | 'advanced';
  onEdit: (record: QSORecord) => void;
  onDelete: (record: QSORecord) => void;
  t: (key: string) => string;
}

export const getColumns = ({ userMode, onEdit, onDelete, t }: ColumnsProps): ColumnDef<QSORecord>[] => {
  const columns: ColumnDef<QSORecord>[] = [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
            className="lg:hidden"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : null;
      },
    },
    {
      accessorKey: "datetime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0"
          >
            {t("qso.fields.datetime")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatDateTimeForDisplay(row.getValue("datetime")),
    },
    {
      accessorKey: "callsign",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0"
          >
            {t("qso.fields.callsign")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const callsign = row.getValue("callsign") as string;
        return (
          <div className="flex items-center gap-2">
            <strong>{callsign || "-"}</strong>
            {callsign && (
              <a
                href={`https://www.qrz.com/db/${callsign}`}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
                title={t("common.viewOnQrz")}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: t("qso.fields.name"),
      cell: ({ row }) => row.getValue("name") || "-",
    },
    {
      accessorKey: "freq",
      header: t("qso.fields.frequencyShort"),
      cell: ({ row }) => {
        const freq = row.getValue("freq") as number | undefined;
        return freq ? `${parseFloat(freq.toString()).toFixed(3)} MHz` : "-";
      },
    },
  ];

  // Add advanced mode columns
  if (userMode === 'advanced') {
    columns.push(
      {
        accessorKey: "mode",
        header: t("qso.fields.mode"),
        cell: ({ row }) => row.getValue("mode") || "-",
      },
      {
        accessorKey: "txPower",
        header: t("qso.fields.powerShort"),
        cell: ({ row }) => {
          const power = row.getValue("txPower") as number | undefined;
          return power ? `${power} W` : "-";
        },
      },
      {
        accessorKey: "rstSent",
        header: t("qso.fields.rstSentShort"),
        cell: ({ row }) => row.getValue("rstSent") || "-",
      },
      {
        accessorKey: "rstReceived",
        header: t("qso.fields.rstReceivedShort"),
        cell: ({ row }) => row.getValue("rstReceived") || "-",
      }
    );
  }

  // Add common columns
  columns.push(
    {
      accessorKey: "qth",
      header: userMode === 'simple' ? t("qso.fields.qthShort") : t("qso.fields.gridSquare"),
      cell: ({ row }) => row.getValue("qth") || "-",
    },
    {
      accessorKey: "notes",
      header: t("qso.fields.notes"),
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string;
        if (!notes) return "-";
        return (
          <span className="text-muted-foreground text-sm" title={notes}>
            {notes.length > 30 ? notes.substring(0, 30) + "..." : notes}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: t("qso.fields.actions"),
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
              className="lg:hidden"
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        );
      },
    }
  );

  return columns;
};
