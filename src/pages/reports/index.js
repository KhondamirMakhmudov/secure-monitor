import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/all/useGetQuery";
import { requestEventTracker } from "@/services/api";
import { useSession } from "next-auth/react";
import { useState } from "react";
import dayjs from "dayjs";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import LoginIcon from "@mui/icons-material/Login";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// ─── Shared styles ────────────────────────────────────────────────────────────
const CyberStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
    .font-mono-cyber { font-family: 'Share Tech Mono', monospace; }
    .font-display    { font-family: 'Rajdhani', sans-serif; }
    @keyframes borderPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
    .pulse-dot { animation: borderPulse 1.5s ease-in-out infinite; }
    .shimmer {
      background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%);
      background-size: 400px 100%;
      animation: shimmer 1.4s ease-in-out infinite;
    }
    .table-row-hover { transition: background 0.15s ease, box-shadow 0.15s ease; }
    .table-row-hover:hover {
      background: rgba(56,189,248,0.04);
      box-shadow: inset 3px 0 0 rgba(56,189,248,0.5);
    }
  `}</style>
);

// ─── Corner brackets ──────────────────────────────────────────────────────────
const Corner = ({ pos, color = "sky" }) => {
  const colors = {
    sky: "border-sky-500/50 [box-shadow:0_0_6px_rgba(56,189,248,0.35)]",
    green: "border-green-400/50 [box-shadow:0_0_6px_rgba(0,255,136,0.35)]",
  };
  const posClass = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  }[pos];
  return <div className={`absolute w-4 h-4 ${posClass} ${colors[color]}`} />;
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div
          className="h-3 rounded shimmer"
          style={{ width: `${55 + ((i * 17) % 40)}%` }}
        />
      </td>
    ))}
  </tr>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ success }) =>
  success ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono-cyber text-[10px] font-bold tracking-wider bg-green-400/10 border border-green-400/30 text-green-400">
      <CheckCircleOutlineIcon sx={{ fontSize: 11 }} /> РАЗРЕШЁН
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono-cyber text-[10px] font-bold tracking-wider bg-red-500/10 border border-red-500/30 text-red-400">
      <ErrorOutlineIcon sx={{ fontSize: 11 }} /> ЗАПРЕЩЁН
    </span>
  );

// ─── Event type badge ─────────────────────────────────────────────────────────
const EventBadge = ({ type }) => {
  const isEntry = type === "Вход";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono-cyber text-[10px] font-bold tracking-wider ${
        isEntry
          ? "bg-sky-500/10 border border-sky-500/30 text-sky-400"
          : "bg-violet-500/10 border border-violet-500/30 text-violet-400"
      }`}
    >
      {isEntry ? (
        <LoginIcon sx={{ fontSize: 11 }} />
      ) : (
        <ExitToAppIcon sx={{ fontSize: 11 }} />
      )}
      {type}
    </span>
  );
};

// ─── Pagination button ────────────────────────────────────────────────────────
const PageBtn = ({ children, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[34px] h-[34px] flex items-center justify-center rounded-lg font-mono-cyber text-xs transition-all duration-150 border ${
      active
        ? "bg-sky-500/15 border-sky-500/50 text-sky-300 [box-shadow:0_0_10px_rgba(56,189,248,0.2)]"
        : disabled
          ? "border-white/[0.04] text-slate-700 cursor-not-allowed bg-transparent"
          : "border-white/[0.06] text-slate-500 hover:border-sky-500/30 hover:text-sky-400 hover:bg-sky-500/[0.06] bg-transparent"
    }`}
  >
    {children}
  </button>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const Index = () => {
  const { data: session } = useSession();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | granted | denied
  const [filterType, setFilterType] = useState("all"); // all | entry | exit

  const { data: reports, isLoading } = useGetQuery({
    key: [KEYS.reports, page, pageSize],
    url: URLS.reports,
    apiClient: requestEventTracker,
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    params: { page, pageSize },
    enabled: !!session?.accessToken,
  });

  const rows = reports?.data?.data ?? reports?.results ?? reports ?? [];
  const totalCount = reports?.total ?? reports?.count ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Client-side filter on top of paginated data
  const filtered = rows.filter((r) => {
    const name = (r.cardName || "").toLowerCase();
    const dept = "".toLowerCase();
    const cp = (r.checkPointName || "").toLowerCase();
    const matchSearch =
      !search ||
      name.includes(search.toLowerCase()) ||
      dept.includes(search.toLowerCase()) ||
      cp.includes(search.toLowerCase());
    const isSuccess = r.errorCode === "Успешно";
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "granted" && isSuccess) ||
      (filterStatus === "denied" && !isSuccess);
    const matchType =
      filterType === "all" ||
      (filterType === "entry" && r.eventType === "Вход") ||
      (filterType === "exit" && r.eventType === "Выход");
    return matchSearch && matchStatus && matchType;
  });

  // Pagination range
  const pageRange = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    )
      range.push(i);
    if (page - delta > 2) range.unshift("...");
    if (page + delta < totalPages - 1) range.push("...");
    if (totalPages > 1) {
      range.unshift(1);
      range.push(totalPages);
    } else range.unshift(1);
    return [...new Set(range)];
  };

  return (
    <>
      <CyberStyles />
      <div className="my-6 sm:my-10 lg:my-14 space-y-6">
        {/* ── Page header ── */}
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-wide text-slate-100 sm:text-3xl lg:text-4xl">
            Отчёты
          </h1>
          <p className="font-mono-cyber text-xs text-slate-500 tracking-widest">
            Журнал проходов сотрудников · {totalCount} записей
          </p>
        </div>

        {/* ── Filters bar ── */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/[0.07] p-4 [box-shadow:0_4px_24px_rgba(0,0,0,0.4)]">
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <SearchIcon
                sx={{ fontSize: 16, color: "#475569" }}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Поиск по имени, отделу, КПП..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] font-mono-cyber text-xs text-slate-300 placeholder-slate-600 tracking-wide outline-none focus:border-sky-500/50 focus:bg-sky-500/[0.04] transition-all duration-150"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1">
              <FilterListIcon sx={{ fontSize: 14, color: "#475569" }} />
              {[
                { val: "all", label: "Все" },
                { val: "granted", label: "Разрешён" },
                { val: "denied", label: "Запрещён" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => {
                    setFilterStatus(val);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-mono-cyber text-[10px] tracking-widest uppercase border transition-all duration-150 ${
                    filterStatus === val
                      ? val === "granted"
                        ? "bg-green-400/10 border-green-400/40 text-green-400"
                        : val === "denied"
                          ? "bg-red-500/10 border-red-500/40 text-red-400"
                          : "bg-sky-500/10 border-sky-500/40 text-sky-400"
                      : "bg-transparent border-white/[0.06] text-slate-600 hover:border-white/[0.12] hover:text-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1">
              {[
                { val: "all", label: "Вход/Выход" },
                { val: "entry", label: "Вход" },
                { val: "exit", label: "Выход" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => {
                    setFilterType(val);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-mono-cyber text-[10px] tracking-widest uppercase border transition-all duration-150 ${
                    filterType === val
                      ? "bg-violet-500/10 border-violet-500/40 text-violet-400"
                      : "bg-transparent border-white/[0.06] text-slate-600 hover:border-white/[0.12] hover:text-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Page size */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="font-mono-cyber text-[10px] text-slate-600 tracking-widest uppercase">
                Строк
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] font-mono-cyber text-xs text-slate-400 outline-none focus:border-sky-500/40 transition-all duration-150 cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n} className="bg-slate-900">
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/[0.07] [box-shadow:0_8px_40px_rgba(0,0,0,0.5)]">
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />

          {/* Table header strip */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[linear-gradient(90deg,rgba(56,189,248,0.03),transparent,rgba(56,189,248,0.03))]">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 pulse-dot [box-shadow:0_0_6px_#38bdf8]" />
            <span className="font-mono-cyber text-[10px] font-bold tracking-[0.2em] uppercase text-sky-400">
              ЖУРНАЛ ДОСТУПА
            </span>
            {!isLoading && (
              <span className="ml-auto font-mono-cyber text-[10px] text-slate-600 tracking-widest">
                {filtered.length} / {totalCount}
              </span>
            )}
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {[
                    "#",
                    "Сотрудник",
                    "КПП",
                    "Тип",
                    "Статус",
                    "Дата",
                    "Время",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono-cyber text-[9px] font-bold tracking-[0.2em] uppercase text-slate-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {isLoading ? (
                  [...Array(pageSize)].map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                          <AccessTimeOutlinedIcon
                            sx={{ fontSize: 24, color: "#334155" }}
                          />
                        </div>
                        <p className="font-mono-cyber text-xs text-slate-600 tracking-widest uppercase">
                          Нет данных
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => {
                    const isSuccess = row.errorCode === "Успешно";
                    const date = row.realUtc
                      ? dayjs(row.realUtc).format("DD.MM.YYYY")
                      : "–";
                    const time = row.realUtc
                      ? new Date(row.realUtc).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZone: "Asia/Tashkent",
                        })
                      : "–";
                    return (
                      <tr key={row.id ?? idx} className="table-row-hover">
                        {/* # */}
                        <td className="px-4 py-3">
                          <span className="font-mono-cyber text-[11px] text-slate-600">
                            {(page - 1) * pageSize + idx + 1}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <p className="font-display text-sm font-semibold text-slate-200 leading-tight">
                            {row.cardName || "–"}
                          </p>
                          <p className="font-mono-cyber text-[10px] text-slate-600 mt-0.5"></p>
                        </td>

                        {/* Checkpoint */}
                        <td className="px-4 py-3">
                          <span className="font-mono-cyber text-[11px] text-slate-400">
                            {row.checkPointName || "–"}
                          </span>
                        </td>

                        {/* Event type */}
                        <td className="px-4 py-3">
                          <EventBadge type={row.eventType} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge success={isSuccess} />
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <span className="font-mono-cyber text-[11px] text-slate-400">
                            {date}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-4 py-3">
                          <span className="font-mono-cyber text-[11px] text-slate-300">
                            {time}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
              <span className="font-mono-cyber text-[10px] text-slate-600 tracking-widest">
                Стр. {page} из {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <PageBtn disabled={page === 1} onClick={() => setPage(1)}>
                  «
                </PageBtn>
                <PageBtn
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹
                </PageBtn>
                {pageRange().map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`dot-${i}`}
                      className="font-mono-cyber text-xs text-slate-700 px-1"
                    >
                      …
                    </span>
                  ) : (
                    <PageBtn
                      key={p}
                      active={p === page}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </PageBtn>
                  ),
                )}
                <PageBtn
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ›
                </PageBtn>
                <PageBtn
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  »
                </PageBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;

export async function getStaticProps() {
  return {
    props: {
      bgColor: "bg-gray-100",
      headerBg: "bg-white",
    },
  };
}
