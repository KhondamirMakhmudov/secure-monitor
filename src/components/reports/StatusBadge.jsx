import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export const StatusBadge = ({ success }) =>
  success ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono-cyber text-[10px] font-bold tracking-wider bg-green-400/10 border border-green-400/30 text-green-400">
      <CheckCircleOutlineIcon sx={{ fontSize: 11 }} /> РАЗРЕШЁН
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono-cyber text-[10px] font-bold tracking-wider bg-red-500/10 border border-red-500/30 text-red-400">
      <ErrorOutlineIcon sx={{ fontSize: 11 }} /> ЗАПРЕЩЁН
    </span>
  );
