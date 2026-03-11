import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { SkeletonRow } from "./SkeletonRow";
import { Corner } from "./Corner";

export const CustomTable = ({
  columns = [],
  data = [],
  isLoading = false,
  pageSize = 10,
  renderRow = null,
  title = "ЖУРНАЛ ДОСТУПА",
  count = 0,
  dataCount = 0,
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/[0.07] [box-shadow:0_8px_40px_rgba(0,0,0,0.5)]">
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* Table header strip */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[linear-gradient(90deg,rgba(56,189,248,0.03),transparent,rgba(56,189,248,0.03))]">
        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 pulse-dot [box-shadow:0_0_6px_#38bdf8]" />
        <span className="font-mono-cyber text-[10px] font-bold tracking-[0.2em] uppercase text-sky-400">
          {title}
        </span>
        {!isLoading && (
          <span className="ml-auto font-mono-cyber text-[10px] text-slate-600 tracking-widest">
            {dataCount} / {count}
          </span>
        )}
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-mono-cyber text-[9px] font-bold tracking-[0.2em] uppercase text-slate-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {isLoading ? (
              [...Array(pageSize)].map((_, i) => <SkeletonRow key={i} />)
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
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
              data.map((row, idx) => (
                <tr key={row.id ?? idx} className="table-row-hover">
                  {renderRow ? (
                    renderRow(row, idx)
                  ) : (
                    <td>{JSON.stringify(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
