import { useIndexStore, type TimeRange } from "@/store/index";

const TABS: TimeRange[] = ["1D", "1W", "1M", "1Y", "ALL"];

export default function TimeRangeTabs() {
  const activeRange   = useIndexStore((s) => s.activeRange);
  const setActiveRange = useIndexStore((s) => s.setActiveRange);

  return (
    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1 w-fit">
      {TABS.map((tab) => {
        const isActive = activeRange === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveRange(tab)}
            className={[
              "px-4 py-1.5 rounded-xl text-xs font-mono font-bold tracking-widest transition-all duration-150",
              isActive
                ? "bg-[#00ff88] text-zinc-950"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
            ].join(" ")}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}