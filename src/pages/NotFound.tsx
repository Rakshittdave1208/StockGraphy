import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-zinc-800/70 bg-[#0b1117] px-6 py-10 sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,255,136,0.16),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.12),_transparent_28%)]" />

      <div className="relative flex max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full border border-[#00ff88]/25 bg-[#00ff88]/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[#72ffbc]">
            Error 404
          </span>

          <div className="flex flex-col gap-3">
            <p className="font-mono text-5xl font-bold tracking-tight text-white sm:text-6xl">
              404
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              This page does not exist in the current market view.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              We could not find <span className="font-mono text-zinc-200">{pathname}</span>.
              The route may be unavailable, moved, or still waiting to be built.
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 sm:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Try one of the active sections</p>
            <p className="text-sm text-zinc-500">
              Dashboard, Portfolio, and Analytics are wired up and available right now.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-[#00ff88] px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-all duration-150 hover:bg-[#33ff9f]"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-600 hover:bg-zinc-800"
            >
              Open Portfolio
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
