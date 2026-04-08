import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Market", to: "/dashboard" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Analytics", to: "/analytics" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="shrink-0 border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold tracking-wide text-white">
            StockGraphy
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:block">
            Quantitative Atelier
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ label, to }) => {
            const active = pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={[
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-[#00ff88] px-4 py-1.5 text-sm font-medium text-zinc-950 transition-all duration-150 hover:bg-[#1affaa]"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
