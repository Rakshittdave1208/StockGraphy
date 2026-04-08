interface SentimentBadgeProps {
  pct?:   number;   // 0-100, e.g. 72 = 72% bullish
  label?: string;   // "Bullish Intensity"
  sub?:   string;   // "Based on quantitative volume..."
}

export default function SentimentBadge({
  pct   = 72,
  label = "Bullish Intensity",
  sub   = "Based on quantitative volume analysis",
}: SentimentBadgeProps) {
  const isBullish    = pct >= 50;
  const color        = isBullish ? "#00ff88" : "#ff4f4f";
  const bgColor      = isBullish ? "bg-[#00ff88]/10" : "bg-red-500/10";
  const borderColor  = isBullish ? "border-[#00ff88]/20" : "border-red-500/20";
  const textColor    = isBullish ? "text-[#00ff88]" : "text-red-400";
  const sentiment    = isBullish ? "Bullish" : "Bearish";

  // SVG donut ring
  const radius       = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset   = circumference - (pct / 100) * circumference;

  return (
    <div className={`flex items-center gap-4 ${bgColor} border ${borderColor} rounded-3xl px-5 py-4`}>

      {/* Donut chart */}
      <div className="relative shrink-0">
        <svg width="52" height="52" viewBox="0 0 52 52">
          {/* Track */}
          <circle
            cx="26" cy="26" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="5"
          />
          {/* Progress */}
          <circle
            cx="26" cy="26" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 26 26)"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold ${textColor}`}
        >
          {pct}%
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className={`font-semibold text-sm ${textColor}`}>
          {sentiment} {label.replace("Bullish ", "").replace("Bearish ", "")}
        </span>
        <span className="text-zinc-600 text-xs mt-0.5 leading-snug max-w-[180px]">
          {sub}
        </span>
      </div>
    </div>
  );
}