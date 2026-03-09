"use client";

import { Modal } from "@mui/material";

const ExitModal = ({
  open,
  onClose,
  handleLogout,
  title = "Вы уверены, что хотите покинуть страницу?",
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Card */}
        <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/[0.08] [box-shadow:0_0_0_1px_rgba(255,51,85,0.08),0_0_40px_rgba(255,51,85,0.15),0_24px_64px_rgba(0,0,0,0.7)]">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500 [box-shadow:0_0_6px_rgba(255,51,85,0.5)]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500 [box-shadow:0_0_6px_rgba(255,51,85,0.5)]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500 [box-shadow:0_0_6px_rgba(255,51,85,0.5)]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500 [box-shadow:0_0_6px_rgba(255,51,85,0.5)]" />

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,51,85,0.06)_0%,transparent_60%)]" />

          {/* Header strip */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[linear-gradient(90deg,rgba(255,51,85,0.04),transparent,rgba(255,51,85,0.04))]">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 [box-shadow:0_0_6px_#ff3355] [animation:borderPulse_1.5s_ease-in-out_infinite]" />
            <span className="font-mono-cyber text-[10px] font-bold tracking-[0.2em] uppercase text-red-400">
              ПРЕДУПРЕЖДЕНИЕ
            </span>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            {/* Icon + title */}
            <div className="flex items-start gap-4">
              {/* Warning icon */}
              <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/30 [box-shadow:0_0_16px_rgba(255,51,85,0.2)]">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff3355"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <p className="font-display text-base font-semibold leading-snug text-slate-200 pt-1">
                {title}
              </p>
            </div>

            {/* Divider dots */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-red-500/20" />
              {[0.2, 0.4, 0.6, 0.4, 0.2].map((op, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-red-500 [box-shadow:0_0_4px_#ff3355]"
                  style={{ opacity: op }}
                />
              ))}
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-red-500/20" />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* No / Cancel */}
              <button
                onClick={onClose}
                className="relative overflow-hidden rounded-xl px-5 py-3 font-display text-sm font-bold tracking-widest uppercase text-sky-300 bg-slate-900 border border-sky-500/30 transition-all duration-200 hover:border-sky-400/60 hover:bg-sky-500/10 hover:[box-shadow:0_0_16px_rgba(56,189,248,0.2)] hover:scale-[1.02] active:scale-[0.98] [box-shadow:0_0_0_1px_rgba(56,189,248,0.08)]"
              >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.07)_0%,transparent_60%)]" />
                <span className="relative">Нет</span>
              </button>

              {/* Yes / Confirm */}
              <button
                onClick={handleLogout}
                className="relative overflow-hidden rounded-xl px-5 py-3 font-display text-sm font-bold tracking-widest uppercase text-red-300 bg-slate-900 border border-red-500/40 transition-all duration-200 hover:border-red-400/70 hover:bg-red-500/10 hover:[box-shadow:0_0_20px_rgba(255,51,85,0.3)] hover:scale-[1.02] active:scale-[0.98] [box-shadow:0_0_0_1px_rgba(255,51,85,0.1),0_0_12px_rgba(255,51,85,0.08)]"
              >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,51,85,0.08)_0%,transparent_60%)]" />
                <span className="relative">Да</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExitModal;
