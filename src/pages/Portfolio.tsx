export default function Portfolio() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Portfolio Overview
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Quantitative Atelier</p>
      </div>

      {/* Net worth */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
            Total Net Worth
          </p>
          <p className="font-mono text-white font-bold text-3xl">
            $1,248,692
          </p>
          <p className="text-[#00ff88] text-sm font-mono mt-1">+4%</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
            Total P&amp;L (Today)
          </p>
          <p className="font-mono text-[#00ff88] font-bold text-3xl">
            +$12,450.12
          </p>
          <p className="text-zinc-500 text-sm font-mono mt-1">Real-time tracking active</p>
        </div>
      </div>

      {/* Active positions placeholder */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-white font-semibold text-xl tracking-tight mb-4">
          Active Positions
        </h2>
        <div className="flex items-center justify-center h-32 text-zinc-600 font-mono text-sm">
          PositionsTable.tsx goes here
        </div>
      </div>
    </div>
  );
}