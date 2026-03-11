import LoginIcon from "@mui/icons-material/Login";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

export const EventBadge = ({ type }) => {
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
