import { create } from "zustand";

export type IndexId =
  | "sensex"
  | "nifty50"
  | "banknifty"
  | "niftynext50"
  | "finnifty";

export type TimeRange = "1D" | "1W" | "1M" | "1Y" | "ALL";

export interface Quote {
  ltp:       number;
  open:      number;
  high:      number;
  low:       number;
  close:     number;
  change:    number;
  changePct: number;
  volume:    number;
}

export interface Candle {
  time:   number; // Unix seconds
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export const INDEX_LABELS: Record<IndexId, string> = {
  sensex:      "SENSEX",
  nifty50:     "NIFTY 50",
  banknifty:   "BANKNIFTY",
  niftynext50: "NIFTY NEXT 50",
  finnifty:    "FINNIFTY",
};

interface IndexState {
  selectedIndex: IndexId;
  activeRange:   TimeRange;
  quotes:        Partial<Record<IndexId, Quote>>;
  candles:       Partial<Record<string, Candle[]>>; // key: `${indexId}:${range}`

  setSelectedIndex: (id: IndexId)      => void;
  setActiveRange:   (r: TimeRange)     => void;
  setQuote:         (id: IndexId, q: Quote)          => void;
  setCandles:       (id: IndexId, r: TimeRange, c: Candle[]) => void;
  getCandles:       (id: IndexId, r: TimeRange) => Candle[] | undefined;
}

export const useIndexStore = create<IndexState>((set, get) => ({
  selectedIndex: "nifty50",
  activeRange:   "1D",
  quotes:        {},
  candles:       {},

  setSelectedIndex: (id)      => set({ selectedIndex: id }),
  setActiveRange:   (r)       => set({ activeRange: r }),
  setQuote:         (id, q)   => set((s) => ({ quotes: { ...s.quotes, [id]: q } })),

  setCandles: (id, r, c) =>
    set((s) => ({ candles: { ...s.candles, [`${id}:${r}`]: c } })),

  getCandles: (id, r) => get().candles[`${id}:${r}`],
}));