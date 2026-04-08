import { useIndexStore } from "@/store/index";
import { useIndexQuote } from "@/hooks/useIndexQuote";
import IndexHeader    from "@/components/IndexHeader";
import StatsCard      from "@/components/StatsCard";
import TimeRangeTabs  from "@/components/TimeRangeTabs";
import CandleChart    from "@/components/CandleChart";
import SentimentBadge from "@/components/Sentimentbadge";

function fmt(n: number): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Dashboard() {
  const selectedIndex = useIndexStore((s) => s.selectedIndex);
  const activeRange   = useIndexStore((s) => s.activeRange);
  const quote         = useIndexStore((s) => s.quotes[selectedIndex]);

  // Prefetch all 5 indices so sidebar prices are always fresh
  useIndexQuote("sensex");
  useIndexQuote("nifty50");
  useIndexQuote("banknifty");
  useIndexQuote("niftynext50");
  useIndexQuote("finnifty");

  const isUp = (quote?.changePct ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-6 max-w-300">

      {/* ── Top row: header + sentiment ───────────────── */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <IndexHeader indexId={selectedIndex} />

        <div className="flex items-center gap-3 mt-1">
          <SentimentBadge
            pct={isUp ? 72 : 38}
            label="Bullish Intensity"
            sub="Based on quantitative volume analysis of the last 30 days"
          />
        </div>
      </div>

      {/* ── OHLC stats row ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          label="Open"
          value={fmt(quote?.open ?? 0)}
        />
        <StatsCard
          label="High"
          value={fmt(quote?.high ?? 0)}
          up={true}
        />
        <StatsCard
          label="Low"
          value={fmt(quote?.low ?? 0)}
          up={false}
        />
        <StatsCard
          label="Close"
          value={fmt(quote?.close ?? 0)}
          up={isUp}
        />
      </div>

      {/* ── Chart section ─────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4">

        {/* Chart header: title + tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-white font-semibold text-lg tracking-tight">
              Price Chart
            </p>
            <p className="text-zinc-500 text-xs font-mono mt-0.5">
              {activeRange === "1D" ? "Intraday · 1 min candles" :
               activeRange === "1W" ? "Weekly · 30 min candles"  :
               activeRange === "1M" ? "Monthly · 1 hr candles"   :
               activeRange === "1Y" ? "Yearly · Daily candles"   :
               "All time · Weekly candles"}
            </p>
          </div>
          <TimeRangeTabs />
        </div>

        {/* Lightweight chart */}
        <CandleChart indexId={selectedIndex} range={activeRange} />
      </div>

      {/* ── Bottom stats row ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          label="Volume"
          value={
            quote?.volume
              ? quote.volume >= 1_000_000
                ? `${(quote.volume / 1_000_000).toFixed(2)}M`
                : `${(quote.volume / 1_000).toFixed(1)}K`
              : "—"
          }
        />
        <StatsCard
          label="Sector focus"
          value="Tech & Finance"
        />
        <StatsCard
          label="Volatility"
          value="Low Risk"
        />
        <StatsCard
          label="Active positions"
          value="24 Trades"
        />
      </div>

    </div>
  );
}