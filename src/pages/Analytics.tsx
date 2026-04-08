export default function Analytics() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Market Intelligence
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Deep-dive quantitative analysis for Nasdaq 100 derivatives
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* VIX */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
            Implied Volatility (VIX)
          </p>
          <p className="font-mono text-white font-bold text-4xl">14.82</p>
          <p className="text-red-400 text-sm font-mono mt-1">-8.4%</p>
        </div>

        {/* Sentiment */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
            Risk Sentiment
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 border-2 border-[#00ff88] flex items-center justify-center">
              <span className="text-[#00ff88] text-xs font-mono font-bold">72%</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Bullish Bias</p>
              <p className="text-zinc-500 text-xs">Strong accumulation in tech</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-64 flex items-center justify-center">
        <p className="text-zinc-600 font-mono text-sm">
          Market Correlation Chart goes here
        </p>
      </div>

      {/* Sector heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-white font-semibold mb-4">Sector Performance Heatmap</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: "TECH",  pct: +0.82, color: "bg-[#00ff88]/20 border-[#00ff88]/30 text-[#00ff88]" },
            { name: "ENRG",  pct: -1.12, color: "bg-red-500/20 border-red-500/30 text-red-400" },
            { name: "FINA",  pct: +0.15, color: "bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00ff88]" },
            { name: "HLTH",  pct:  0.00, color: "bg-zinc-800 border-zinc-700 text-zinc-400" },
          ].map(({ name, pct, color }) => (
            <div key={name} className={`border rounded-2xl p-4 ${color}`}>
              <p className="font-mono text-xs font-bold">{name}</p>
              <p className="font-mono text-sm font-bold mt-1">
                {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}