import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useQSO } from "@/contexts/QSOContext";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

const QSOPagination: React.FC = () => {
  const { pagination, setPage } = useQSO();
  const { currentPage, totalPages } = pagination;

  const renderPageItems = () => {
    const items = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setPage(1)} className="cursor-pointer">
            <ChevronsLeft className="w-4 h-4" />
          </PaginationLink>
        </PaginationItem>,
        <PaginationItem key="prev">
          <PaginationPrevious
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>,
      );
      if (start > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={i === currentPage}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key="next">
          <PaginationNext
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>,
        <PaginationItem key="last">
          <PaginationLink onClick={() => setPage(totalPages)} className="cursor-pointer">
            <ChevronsRight className="w-4 h-4" />
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <nav
      aria-label="QSO tablosu sayfalama"
      className="flex justify-center"
    >
      <Pagination>
        <PaginationContent>{renderPageItems()}</PaginationContent>
      </Pagination>
    </nav>
  );
};

export default QSOPagination;
