import CandleChart from "@/components/CandleChart";
import IndexHeader from "@/components/IndexHeader";
import StatsCard from "@/components/StatsCard";
import TimeRangeTabs from "@/components/TimeRangeTabs";
import { useIndexQuote } from "@/hooks/useIndexQuote";
import { formatInr, formatSignedInr } from "@/lib/currency";
import { useIndexStore } from "@/store";

function fmtNumber(value: number | undefined): string {
  return formatInr(value);
}

export default function Dashboard() {
  const selectedIndex = useIndexStore((state) => state.selectedIndex);
  const activeRange = useIndexStore((state) => state.activeRange);
  const { data: quote } = useIndexQuote(selectedIndex);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <IndexHeader indexId={selectedIndex} />
        <TimeRangeTabs />
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard label="Open" value={fmtNumber(quote?.open)} />
        <StatsCard label="High" value={fmtNumber(quote?.high)} up />
        <StatsCard label="Low" value={fmtNumber(quote?.low)} up={false} />
        <StatsCard label="Close" value={fmtNumber(quote?.close)} />
      </div>

      <CandleChart indexId={selectedIndex} range={activeRange} />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Daily Change"
          value={`${quote?.changePct?.toFixed(2) ?? "0.00"}%`}
          sub={formatSignedInr(quote?.change)}
          up={(quote?.changePct ?? 0) >= 0}
        />
        <StatsCard
          label="Volume"
          value={(quote?.volume ?? 0).toLocaleString("en-IN")}
          sub="Accumulated market volume"
        />
        <StatsCard
          label="Selected Index"
          value={selectedIndex.toUpperCase()}
          sub={`Range: ${activeRange}`}
        />
      </div>
    </div>
  );
}
