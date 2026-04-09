import { useLocation, useNavigate } from "react-router-dom";
import { useIndexQuote } from "@/hooks/useIndexQuote";
import { formatInr } from "@/lib/currency";
import { INDEX_IDS, INDEX_LABELS, useIndexStore } from "@/store";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: <DashIcon /> },
  { label: "Portfolio", to: "/portfolio", icon: <PortIcon /> },
  { label: "Analytics", to: "/analytics", icon: <ChartIcon /> },
  { label: "History", to: "/history", icon: <HistIcon /> },
  { label: "Support", to: "/support", icon: <SuppIcon /> },
];

function DashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
    </svg>
  );
}

function PortIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 11L5 7L8 9L11 4L14 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="9" width="3" height="5" rx="1" fill="currentColor" opacity=".7" />
      <rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor" />
      <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" opacity=".7" />
    </svg>
  );
}

function HistIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 5v3.5l2.5 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SuppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 6C6.5 5.17 7.17 4.5 8 4.5s1.5.67 1.5 1.5c0 1-1.5 1.5-1.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.5" r=".75" fill="currentColor" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatLtp(value: number | undefined): string {
  if (value == null) {
    return "--";
  }

  return formatInr(value);
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeIndex = useIndexStore((state) => state.selectedIndex);
  const quotes = useIndexStore((state) => state.quotes);
  const quoteMeta = useIndexStore((state) => state.quoteMeta);
  const socketConnected = useIndexStore((state) => state.socketConnected);
  const setSelectedIndex = useIndexStore((state) => state.setSelectedIndex);

  useIndexQuote("sensex");
  useIndexQuote("nifty50");
  useIndexQuote("banknifty");
  useIndexQuote("niftynext50");
  useIndexQuote("finnifty");

  return (
    <aside className="app-scrollbar app-scroll-surface flex h-full w-55 shrink-0 flex-col overflow-y-auto border-r border-zinc-800/60 bg-[#0a0e13]">
      <div className="border-b border-zinc-800/60 px-5 pb-4 pt-5">
        <p className="font-mono text-sm font-bold tracking-wide text-white">StockGraphy</p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
          Quantitative Atelier
        </p>
      </div>

      <p className="px-5 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
        Live Indices
      </p>
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          <span className={`h-1.5 w-1.5 rounded-full ${socketConnected ? "bg-[#00ff88]" : "bg-amber-400"}`} />
          <span>{socketConnected ? "Socket streaming" : "REST fallback"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-2.5">
        {INDEX_IDS.map((indexId) => {
          const isActive = activeIndex === indexId;
          const quote = quotes[indexId];
          const meta = quoteMeta[indexId];
          const isUp = (quote?.changePct ?? 0) >= 0;
          const flashClass =
            meta?.source === "socket"
              ? meta.direction === "down"
                ? "live-price-down"
                : meta.direction === "up"
                  ? "live-price-up"
                  : "live-price-flat"
              : "";

          return (
            <button
              key={indexId}
              onClick={() => {
                setSelectedIndex(indexId);
                navigate("/dashboard");
              }}
              className={[
                "relative w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
                isActive
                  ? "border-[#00ff88]/20 bg-[#00ff88]/[0.07]"
                  : "border-transparent hover:bg-zinc-800/40",
              ].join(" ")}
            >
              {isActive ? (
                <span className="absolute bottom-[20%] left-0 top-[20%] w-[2.5px] rounded-r bg-[#00ff88]" />
              ) : null}

              <p
                className={[
                  "mb-1.5 font-mono text-[10px] font-bold tracking-wider",
                  isActive ? "text-[#00ff88]" : "text-zinc-300",
                ].join(" ")}
              >
                {INDEX_LABELS[indexId]}
              </p>

              <div className="flex items-center justify-between">
                <span
                  key={`${indexId}:${meta?.updatedAt ?? 0}`}
                  className={`font-mono text-[11px] font-bold text-white ${flashClass}`.trim()}
                >
                  {formatLtp(quote?.ltp)}
                </span>
                <span
                  className={[
                    "rounded px-1.5 py-0.5 font-mono text-[10px]",
                    isUp
                      ? "bg-[#00ff88]/10 text-[#00ff88]"
                      : "bg-red-500/10 text-red-400",
                  ].join(" ")}
                >
                  {isUp ? "+" : ""}
                  {(quote?.changePct ?? 0).toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mx-5 my-3 border-t border-zinc-800/60" />

      <p className="px-5 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
        Navigation
      </p>

      <nav className="flex flex-1 flex-col gap-0.5 px-2.5">
        {NAV_ITEMS.map(({ label, to, icon }) => {
          const isActive = pathname.startsWith(to);

          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={[
                "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-150",
                isActive
                  ? "border-zinc-700/50 bg-zinc-800/60 text-white"
                  : "border-transparent text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300",
              ].join(" ")}
            >
              <span className={isActive ? "text-[#00ff88]" : "text-current"}>{icon}</span>
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-2.5 pt-3">
        <button className="w-full rounded-xl bg-[#00ff88] py-2.5 text-sm font-semibold text-zinc-950 transition-all duration-150 hover:bg-[#1affaa] active:scale-[0.98]">
          Trade Now
        </button>
      </div>

      <div className="mt-1 border-t border-zinc-800/60 px-2.5 py-3">
        <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition-all duration-150 hover:bg-zinc-800/40 hover:text-zinc-400">
          <SettingsIcon />
          Settings
        </button>
      </div>
    </aside>
  );
}
