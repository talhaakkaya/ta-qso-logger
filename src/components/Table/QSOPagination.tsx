import React from "react";
import { Pagination } from "react-bootstrap";
import { useQSO } from "@/contexts/QSOContext";

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
        <Pagination.First key="first" onClick={() => setPage(1)} />,
        <Pagination.Prev
          key="prev"
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        />,
      );
      if (start > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
      }
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setPage(i)}
        >
          {i}
        </Pagination.Item>,
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
      }
      items.push(
        <Pagination.Next
          key="next"
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        />,
        <Pagination.Last key="last" onClick={() => setPage(totalPages)} />,
      );
    }

    return items;
  };

  return (
    <nav
      aria-label="QSO tablosu sayfalama"
      className="d-flex justify-content-center"
    >
      <Pagination className="mb-0">{renderPageItems()}</Pagination>
    </nav>
  );
};

export default QSOPagination;
