import { create } from "zustand";

export type IndexId =
  | "sensex"
  | "nifty50"
  | "banknifty"
  | "niftynext50"
  | "finnifty";

export type TimeRange = "1D" | "1W" | "1M" | "1Y" | "ALL";

export type QuoteSource = "rest" | "socket";

export interface QuoteMeta {
  updatedAt: number;
  direction: "up" | "down" | "flat";
  source: QuoteSource;
}

export interface Quote {
  ltp:       number;
  open:      number;
  high:      number;
  low:       number;
  close:     number;
  change:    number;
  changePct: number;
  volume:    number;
  timestamp?: number;
}

export interface Candle {
  time:   number; // Unix seconds
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export const INDEX_IDS: IndexId[] = [
  "sensex",
  "nifty50",
  "banknifty",
  "niftynext50",
  "finnifty",
];

export const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "1Y", "ALL"];

export const INDEX_LABELS: Record<IndexId, string> = {
  sensex:      "SENSEX",
  nifty50:     "NIFTY 50",
  banknifty:   "BANKNIFTY",
  niftynext50: "NIFTY NEXT 50",
  finnifty:    "FINNIFTY",
};

const IST_OFFSET_SECONDS = 5.5 * 60 * 60;

export function getCandlesKey(id: IndexId, range: TimeRange): string {
  return `${id}:${range}`;
}

function getQuoteDirection(previous: Quote | undefined, next: Quote): QuoteMeta["direction"] {
  if (!previous) {
    return "flat";
  }

  if (next.ltp > previous.ltp) {
    return "up";
  }

  if (next.ltp < previous.ltp) {
    return "down";
  }

  return "flat";
}

function getIstDayBucketTime(timestampSeconds: number): number {
  const shiftedDate = new Date((timestampSeconds + IST_OFFSET_SECONDS) * 1000);

  return (
    Date.UTC(
      shiftedDate.getUTCFullYear(),
      shiftedDate.getUTCMonth(),
      shiftedDate.getUTCDate(),
    ) /
      1000 -
    IST_OFFSET_SECONDS
  );
}

function getIstWeekBucketTime(timestampSeconds: number): number {
  const dayBucket = getIstDayBucketTime(timestampSeconds);
  const shiftedDate = new Date((timestampSeconds + IST_OFFSET_SECONDS) * 1000);
  const daysSinceMonday = (shiftedDate.getUTCDay() + 6) % 7;

  return dayBucket - daysSinceMonday * 24 * 60 * 60;
}

function getBucketTime(range: TimeRange, timestampSeconds: number): number {
  switch (range) {
    case "1D":
      return Math.floor((timestampSeconds + IST_OFFSET_SECONDS) / 60) * 60 - IST_OFFSET_SECONDS;
    case "1W":
      return Math.floor((timestampSeconds + IST_OFFSET_SECONDS) / (30 * 60)) * (30 * 60) - IST_OFFSET_SECONDS;
    case "1M":
      return Math.floor((timestampSeconds + IST_OFFSET_SECONDS) / (60 * 60)) * (60 * 60) - IST_OFFSET_SECONDS;
    case "1Y":
      return getIstDayBucketTime(timestampSeconds);
    case "ALL":
      return getIstWeekBucketTime(timestampSeconds);
  }
}

function upsertLiveCandle(
  candles: Candle[],
  range: TimeRange,
  quote: Quote,
  timestampSeconds: number,
  volumeDelta: number,
): Candle[] {
  if (!candles.length) {
    return candles;
  }

  const bucketTime = getBucketTime(range, timestampSeconds);
  const lastCandle = candles[candles.length - 1];

  if (!lastCandle || bucketTime < lastCandle.time) {
    return candles;
  }

  if (bucketTime === lastCandle.time) {
    const nextCandle: Candle = {
      ...lastCandle,
      high: Math.max(lastCandle.high, quote.ltp),
      low: Math.min(lastCandle.low, quote.ltp),
      close: quote.ltp,
      volume: Math.max(lastCandle.volume + volumeDelta, 0),
    };

    if (
      nextCandle.high === lastCandle.high &&
      nextCandle.low === lastCandle.low &&
      nextCandle.close === lastCandle.close &&
      nextCandle.volume === lastCandle.volume
    ) {
      return candles;
    }

    return [...candles.slice(0, -1), nextCandle];
  }

  return [
    ...candles,
    {
      time: bucketTime,
      open: quote.ltp,
      high: quote.ltp,
      low: quote.ltp,
      close: quote.ltp,
      volume: Math.max(volumeDelta, 0),
    },
  ];
}

interface IndexState {
  selectedIndex: IndexId;
  activeRange:   TimeRange;
  quotes:        Partial<Record<IndexId, Quote>>;
  quoteMeta:     Partial<Record<IndexId, QuoteMeta>>;
  candles:       Partial<Record<string, Candle[]>>; // key: `${indexId}:${range}`
  socketConnected: boolean;

  setSelectedIndex: (id: IndexId)      => void;
  setActiveRange:   (r: TimeRange)     => void;
  setSocketConnected: (connected: boolean) => void;
  setQuote:         (
    id: IndexId,
    q: Quote,
    options?: { source?: QuoteSource; timestamp?: number },
  ) => void;
  ingestLiveQuote:  (id: IndexId, q: Quote) => void;
  setCandles:       (id: IndexId, r: TimeRange, c: Candle[]) => void;
  getCandles:       (id: IndexId, r: TimeRange) => Candle[] | undefined;
}

export const useIndexStore = create<IndexState>((set, get) => ({
  selectedIndex: "nifty50",
  activeRange:   "1D",
  quotes:        {},
  quoteMeta:     {},
  candles:       {},
  socketConnected: false,

  setSelectedIndex: (id)      => set({ selectedIndex: id }),
  setActiveRange:   (r)       => set({ activeRange: r }),
  setSocketConnected: (connected) => set({ socketConnected: connected }),

  setQuote: (id, q, options) =>
    set((s) => {
      const previousQuote = s.quotes[id];
      const updatedAt = options?.timestamp ?? q.timestamp ?? Date.now();

      return {
        quotes: { ...s.quotes, [id]: q },
        quoteMeta: {
          ...s.quoteMeta,
          [id]: {
            updatedAt,
            direction: getQuoteDirection(previousQuote, q),
            source: options?.source ?? "rest",
          },
        },
      };
    }),

  ingestLiveQuote: (id, q) =>
    set((s) => {
      const previousQuote = s.quotes[id];
      const updatedAt = q.timestamp ?? Date.now();
      const quoteTimeSeconds = Math.floor(updatedAt / 1000);
      const volumeDelta = previousQuote ? Math.max(q.volume - previousQuote.volume, 0) : 0;
      let nextCandles = s.candles;

      for (const range of TIME_RANGES) {
        const candleKey = getCandlesKey(id, range);
        const existingCandles = nextCandles[candleKey];

        if (!existingCandles?.length) {
          continue;
        }

        const liveCandles = upsertLiveCandle(existingCandles, range, q, quoteTimeSeconds, volumeDelta);

        if (liveCandles !== existingCandles) {
          if (nextCandles === s.candles) {
            nextCandles = { ...s.candles };
          }

          nextCandles[candleKey] = liveCandles;
        }
      }

      return {
        quotes: { ...s.quotes, [id]: q },
        quoteMeta: {
          ...s.quoteMeta,
          [id]: {
            updatedAt,
            direction: getQuoteDirection(previousQuote, q),
            source: "socket",
          },
        },
        candles: nextCandles,
      };
    }),

  setCandles: (id, r, c) =>
    set((s) => ({ candles: { ...s.candles, [getCandlesKey(id, r)]: c } })),

  getCandles: (id, r) => get().candles[getCandlesKey(id, r)],
}));
