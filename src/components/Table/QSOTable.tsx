import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQSO } from "@/contexts/QSOContext";
import { useUserMode } from "@/hooks/useUserMode";
import { useModal } from "@/hooks/useModal";
import { useQSOActions } from "@/hooks/useQSOActions";
import QSOModal from "@/components/Modals/QSOModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { QSORecord } from "@/types";
import { Table as TableIcon, PlusCircle, Inbox, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getPaginationRowModel,
  ExpandedState,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { getColumns } from "./columns";

const QSOTable: React.FC = () => {
  const { filteredRecords, isLoading } = useQSO();
  const userMode = useUserMode();
  const qsoModal = useModal<QSORecord>();
  const deleteModal = useModal<QSORecord>();
  const { handleSave, handleDelete } = useQSOActions();
  const [isDeleting, setIsDeleting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const handleOpenAddModal = () => {
    qsoModal.open(undefined);
  };

  const handleOpenEditModal = (record: QSORecord) => {
    qsoModal.open(record);
  };

  const handleDeleteClick = (record: QSORecord) => {
    deleteModal.open(record);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.data) return;

    setIsDeleting(true);
    try {
      await handleDelete(deleteModal.data.id);
      deleteModal.close();
    } catch (error) {
      // Error already handled by useQSOActions
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = getColumns({
    userMode,
    onEdit: handleOpenEditModal,
    onDelete: handleDeleteClick,
  });

  const table = useReactTable({
    data: filteredRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    state: {
      sorting,
      expanded,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <>
      <Card className="mb-3">
        <CardHeader className="bg-muted/50 flex flex-row justify-between items-center py-4">
          <h5 className="mb-0 flex items-center gap-2 text-lg font-semibold">
            <TableIcon className="w-5 h-5" />
            QSO Kayıtları
          </h5>
          <Button
            size="sm"
            onClick={handleOpenAddModal}
            title="Yeni QSO Ekle"
          >
            <PlusCircle />
            Yeni QSO
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                    {headerGroup.headers.map((header) => {
                      // Define which columns to hide on mobile
                      const hiddenOnMobile = ['name', 'freq', 'mode', 'txPower', 'rstSent', 'rstReceived', 'qth', 'notes', 'actions'];
                      const columnId = header.column.id;
                      const mobileClass = hiddenOnMobile.includes(columnId) ? 'hidden lg:table-cell' : '';

                      return (
                        <TableHead key={header.id} className={`font-semibold ${mobileClass}`}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-pointer hover:bg-muted/70 transition-colors border-b"
                        onClick={(e) => {
                          // On mobile, clicking anywhere expands the row
                          if (window.innerWidth < 1024) {
                            e.stopPropagation();
                            row.toggleExpanded();
                          } else {
                            handleOpenEditModal(row.original);
                          }
                        }}
                      >
                        {row.getVisibleCells().map((cell) => {
                          // Define which columns to hide on mobile
                          const hiddenOnMobile = ['name', 'freq', 'mode', 'txPower', 'rstSent', 'rstReceived', 'qth', 'notes', 'actions'];
                          const columnId = cell.column.id;
                          const mobileClass = hiddenOnMobile.includes(columnId) ? 'hidden lg:table-cell' : '';

                          return (
                            <TableCell key={cell.id} className={mobileClass}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      {row.getIsExpanded() && (
                        <TableRow className="lg:hidden border-b">
                          <TableCell colSpan={row.getVisibleCells().length} className="bg-muted/30 p-0">
                            <div className="p-4 text-sm">
                              <div className="grid grid-cols-12 gap-2 mb-2">
                                <div className="col-span-4 text-muted-foreground text-xs">İsim:</div>
                                <div className="col-span-8">{row.original.name || "-"}</div>
                              </div>
                              <div className="grid grid-cols-12 gap-2 mb-2">
                                <div className="col-span-4 text-muted-foreground text-xs">Frekans:</div>
                                <div className="col-span-8">
                                  {row.original.freq ? `${parseFloat(row.original.freq.toString()).toFixed(3)} MHz` : "-"}
                                </div>
                              </div>
                              {userMode === 'advanced' && (
                                <>
                                  <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-4 text-muted-foreground text-xs">Mod:</div>
                                    <div className="col-span-8">{row.original.mode || "-"}</div>
                                  </div>
                                  <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-4 text-muted-foreground text-xs">Güç:</div>
                                    <div className="col-span-8">
                                      {row.original.txPower ? `${row.original.txPower} W` : "-"}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-4 text-muted-foreground text-xs">RST Gön.:</div>
                                    <div className="col-span-8">{row.original.rstSent || "-"}</div>
                                  </div>
                                  <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-4 text-muted-foreground text-xs">RST Alı.:</div>
                                    <div className="col-span-8">{row.original.rstReceived || "-"}</div>
                                  </div>
                                </>
                              )}
                              <div className="grid grid-cols-12 gap-2 mb-2">
                                <div className="col-span-4 text-muted-foreground text-xs">{userMode === 'simple' ? 'QTH:' : 'Grid Square:'}</div>
                                <div className="col-span-8">{row.original.qth || "-"}</div>
                              </div>
                              <div className="grid grid-cols-12 gap-2 mb-3">
                                <div className="col-span-4 text-muted-foreground text-xs">Notlar:</div>
                                <div className="col-span-8">{row.original.notes || "-"}</div>
                              </div>

                              {/* Actions in expanded view */}
                              <div className="flex justify-end gap-2 border-t pt-3">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModal(row.original);
                                  }}
                                >
                                  <Pencil />
                                  Düzenle
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(row.original);
                                  }}
                                >
                                  <Trash2 />
                                  Sil
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Inbox className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-muted-foreground">Henüz QSO kaydı bulunmuyor</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            <span className="sm:hidden">
              {table.getRowModel().rows.length} / {table.getFilteredRowModel().rows.length}
            </span>
            <span className="hidden sm:inline">
              {table.getFilteredRowModel().rows.length} kayıttan {table.getRowModel().rows.length} tanesi gösteriliyor
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Önceki
            </Button>
            <div className="text-sm text-muted-foreground">
              Sayfa {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}

      <QSOModal
        show={qsoModal.show}
        onHide={qsoModal.close}
        record={qsoModal.data}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        show={deleteModal.show}
        record={deleteModal.data}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={deleteModal.close}
      />
    </>
  );
};

export default QSOTable;
