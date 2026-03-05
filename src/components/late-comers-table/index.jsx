import { useMemo, useState } from "react";
import ReactPaginate from "react-paginate";
import Avatar from "@/components/security-monitor/avatar";

const sortDirections = {
  asc: "desc",
  desc: "asc",
};

const getSortValue = (row, key) => {
  if (key === "date" || key === "time") return row.realUtc || "";
  const value = row[key];
  if (typeof value === "number") return value;
  return value ? String(value) : "";
};

export default function LateComersTable({
  rows,
  isLoading,
  isFetching,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
}) {
  const [sortKey, setSortKey] = useState("index");
  const [sortDirection, setSortDirection] = useState("asc");
  const collator = useMemo(
    () => new Intl.Collator("ru", { numeric: true, sensitivity: "base" }),
    [],
  );

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);

      if (aValue === bValue) return 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const comparison = collator.compare(String(aValue), String(bValue));
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [rows, sortKey, sortDirection, collator]);

  const columns = [
    { key: "index", label: "№", sortable: true, align: "left" },
    { key: "name", label: "Сотрудник", sortable: true, align: "left" },
    { key: "department", label: "Отдел", sortable: true, align: "left" },
    { key: "date", label: "Дата", sortable: true, align: "left" },
    { key: "time", label: "Время", sortable: true, align: "left" },
    { key: "event", label: "Событие", sortable: true, align: "left" },
    { key: "status", label: "Статус", sortable: true, align: "left" },
  ];

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirections[sortDirection]);
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const renderSortIcon = (key) => {
    if (sortKey !== key) return null;
    return (
      <span className="ml-2 text-xs text-blue-500">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {isLoading || isFetching ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="shadow overflow-hidden rounded-xl">
            <table className="table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 ${column.align === "left" ? "text-left" : "text-right"} text-xs font-semibold uppercase tracking-wide cursor-pointer select-none`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <span className="inline-flex items-center">
                        {column.label}
                        {column.sortable && renderSortIcon(column.key)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, index) => (
                  <tr key={row.id ?? index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(currentPage - 1) * pageSize + (index + 1)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar size="small" photoUrl={row.photo} />
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{row.department}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3">{row.time}</td>
                    <td className="px-4 py-3">{row.event}</td>
                    <td className="px-4 py-3">
                      {row.status === "Вовремя" && (
                        <span className="status-badge status-on-time">
                          Вовремя
                        </span>
                      )}
                      {row.status === "Опоздал" && (
                        <span className="status-badge status-late">
                          Опоздал
                        </span>
                      )}
                      {row.status === "Неизвестно" && (
                        <span className="status-badge status-unknown">
                          Неизвестно
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!sortedRows.length && (
              <div className="p-6 text-center text-sm text-gray-500">
                Нет данных для отображения
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <ReactPaginate
                breakLabel="..."
                nextLabel="Следующая"
                onPageChange={onPageChange}
                pageRangeDisplayed={3}
                marginPagesDisplayed={2}
                pageCount={totalPages}
                previousLabel="Предыдущая"
                forcePage={currentPage - 1}
                containerClassName="flex flex-wrap items-center gap-2 text-sm"
                pageClassName="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                previousClassName="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                nextClassName="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                activeClassName="!bg-blue-500 !text-white !border-blue-500 cursor-pointer"
                breakClassName="px-2 text-gray-500"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
