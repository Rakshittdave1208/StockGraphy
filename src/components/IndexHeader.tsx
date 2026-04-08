import { useIndexQuote } from "@/hooks/useIndexQuote";
import { INDEX_LABELS, type IndexId } from "@/store";

interface IndexHeaderProps {
  indexId: IndexId;
}

function fmt(value: number): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function IndexHeader({ indexId }: IndexHeaderProps) {
  const { data: quote, isLoading } = useIndexQuote(indexId);
  const isUp = (quote?.changePct ?? 0) >= 0;
  const label = INDEX_LABELS[indexId];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
          Live Market
        </span>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff88]" />
        <span className="font-mono text-xs text-zinc-600">Real-time</span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-white">{label}</h1>

      {isLoading ? (
        <div className="h-10 w-48 animate-pulse rounded-xl bg-zinc-800" />
      ) : (
        <div className="flex items-end gap-4">
          <span className="font-mono text-4xl font-bold tracking-tight text-white">
            {fmt(quote?.ltp ?? 0)}
          </span>

          <div className="mb-1 flex items-center gap-2">
            <span className={`font-mono text-sm font-bold ${isUp ? "text-[#00ff88]" : "text-red-400"}`}>
              {isUp ? "+" : ""}
              {fmt(quote?.change ?? 0)}
            </span>

            <span
              className={[
                "rounded-lg px-2.5 py-1 font-mono text-xs font-bold",
                isUp ? "bg-[#00ff88]/10 text-[#00ff88]" : "bg-red-500/10 text-red-400",
              ].join(" ")}
            >
              {isUp ? "▲" : "▼"} {Math.abs(quote?.changePct ?? 0).toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
