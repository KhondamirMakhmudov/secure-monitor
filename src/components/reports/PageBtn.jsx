export const PageBtn = ({ children, active, disabled, onClick }) => (
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
