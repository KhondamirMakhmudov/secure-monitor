export const Corner = ({ pos, color = "sky" }) => {
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
