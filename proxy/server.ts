import "dotenv/config";
import cors from "cors";
import axios, { type AxiosInstance } from "axios";
import express, { type Request, type Response } from "express";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import Redis from "ioredis";
import { WebSocket } from "ws";

type IndexName = "sensex" | "nifty50" | "banknifty" | "niftynext50" | "finnifty";
type TimeRange = "1D" | "1W" | "1M" | "1Y" | "ALL";

interface Quote {
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePct: number;
  volume: number;
  timestamp?: number;
  cached?: boolean;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UpstoxQuoteRaw {
  last_price: number;
  net_change: number;
  volume: number;
  ohlc?: {
    open?: number;
    high?: number;
    low?: number;
    close?: number;
  };
}

interface UpstoxFeedTick {
  ff?: {
    marketFF?: UpstoxLiveMarketData;
    indexFF?: UpstoxLiveMarketData;
  };
}

interface UpstoxLiveMarketData {
  ltpc?: { ltp: number; cp?: number };
  dayOHLC?: { open: number; high: number; low: number; close: number };
  vtt?: number;
}

interface UpstoxFeedMessage {
  feeds?: Record<string, UpstoxFeedTick>;
}

type UpstoxCandleTuple = [string, number, number, number, number, number];

const PORT = Number(process.env.PORT ?? "5000");
const ACCESS_TOKEN = process.env.UPSTOX_ACCESS_TOKEN ?? "";
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

const CACHE_TTL_QUOTE = 25;
const CACHE_TTL_HISTORY = 5 * 60;

const INSTRUMENT_KEYS: Record<IndexName, string> = {
  sensex: "BSE_INDEX|SENSEX",
  nifty50: "NSE_INDEX|Nifty 50",
  banknifty: "NSE_INDEX|Nifty Bank",
  niftynext50: "NSE_INDEX|Nifty Next 50",
  finnifty: "NSE_INDEX|Nifty Fin Service",
};

const INTERVAL_MAP: Record<TimeRange, string> = {
  "1D": "1minute",
  "1W": "30minute",
  "1M": "1hour",
  "1Y": "1day",
  ALL: "1week",
};

if (!ACCESS_TOKEN) {
  console.warn("UPSTOX_ACCESS_TOKEN is not set. REST and live feed requests will be disabled.");
}

function keyToIndexName(key: string): IndexName | undefined {
  return (Object.keys(INSTRUMENT_KEYS) as IndexName[]).find(
    (indexName) => INSTRUMENT_KEYS[indexName] === key,
  );
}

function isValidIndex(name: string): name is IndexName {
  return name in INSTRUMENT_KEYS;
}

function isValidRange(range: string): range is TimeRange {
  return range in INTERVAL_MAP;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

function getRangeDates(range: TimeRange): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);

  switch (range) {
    case "1D":
      from.setDate(to.getDate() - 1);
      break;
    case "1W":
      from.setDate(to.getDate() - 7);
      break;
    case "1M":
      from.setMonth(to.getMonth() - 1);
      break;
    case "1Y":
      from.setFullYear(to.getFullYear() - 1);
      break;
    case "ALL":
      from.setFullYear(to.getFullYear() - 5);
      break;
  }

  return { from: formatDate(from), to: formatDate(to) };
}

function ensureAccessToken(res: Response): boolean {
  if (ACCESS_TOKEN) {
    return true;
  }

  res.status(503).json({ error: "UPSTOX_ACCESS_TOKEN is not configured" });
  return false;
}

const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  retryStrategy: (attempt: number) => Math.min(attempt * 200, 3000),
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (error: Error) => console.warn("Redis error:", error.message));

async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch {
    console.warn("Redis unavailable. Falling back to in-memory cache.");
  }
}

const memCache = new Map<string, unknown>();

async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return (memCache.get(key) as T) ?? null;
  }
}

async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  const serialized = JSON.stringify(value);

  try {
    await redis.setex(key, ttl, serialized);
  } catch {
    memCache.set(key, value);
    const timer = setTimeout(() => memCache.delete(key), ttl * 1000);
    timer.unref?.();
  }
}

const upstox: AxiosInstance = axios.create({
  baseURL: "https://api.upstox.com",
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    Accept: "application/json",
  },
});

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    redis: redis.status,
    upstoxConfigured: Boolean(ACCESS_TOKEN),
  });
});

app.get("/api/quote/:indexName", async (req: Request<{ indexName: string }>, res: Response) => {
  const { indexName } = req.params;

  if (!isValidIndex(indexName)) {
    res.status(400).json({ error: `Unknown index: ${indexName}` });
    return;
  }

  if (!ensureAccessToken(res)) {
    return;
  }

  const instrumentKey = INSTRUMENT_KEYS[indexName];
  const cacheKey = `quote:${indexName}`;
  const cached = await cacheGet<Quote>(cacheKey);

  if (cached) {
    res.json({ ...cached, cached: true });
    return;
  }

  try {
    const { data } = await upstox.get<{ data: Record<string, UpstoxQuoteRaw> }>(
      "/v2/market-quote/quotes",
      { params: { instrument_key: instrumentKey } },
    );

    const raw = data.data?.[instrumentKey];
    if (!raw) {
      throw new Error("Empty Upstox quote response");
    }

    const previousClose = raw.ohlc?.close ?? 0;
    const quote: Quote = {
      ltp: raw.last_price,
      open: raw.ohlc?.open ?? 0,
      high: raw.ohlc?.high ?? 0,
      low: raw.ohlc?.low ?? 0,
      close: previousClose,
      change: raw.net_change ?? 0,
      changePct: previousClose ? Number(((raw.net_change / previousClose) * 100).toFixed(2)) : 0,
      volume: raw.volume ?? 0,
    };

    await cacheSet(cacheKey, quote, CACHE_TTL_QUOTE);
    res.json(quote);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[quote/${indexName}]`, message);
    res.status(502).json({ error: "Upstox API error", detail: message });
  }
});

app.get("/api/history/:indexName", async (req: Request<{ indexName: string }>, res: Response) => {
  const { indexName } = req.params;
  const rawRange = String(req.query.range ?? "1D");

  if (!isValidIndex(indexName)) {
    res.status(400).json({ error: `Unknown index: ${indexName}` });
    return;
  }

  if (!isValidRange(rawRange)) {
    res.status(400).json({ error: `Unsupported range: ${rawRange}` });
    return;
  }

  if (!ensureAccessToken(res)) {
    return;
  }

  const instrumentKey = INSTRUMENT_KEYS[indexName];
  const interval = INTERVAL_MAP[rawRange];
  const { from, to } = getRangeDates(rawRange);
  const cacheKey = `history:${indexName}:${rawRange}`;
  const cached = await cacheGet<Candle[]>(cacheKey);

  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const encodedKey = encodeURIComponent(instrumentKey);
    const { data } = await upstox.get<{ data?: { candles?: UpstoxCandleTuple[] } }>(
      `/v3/historical-candle/${encodedKey}/${interval}/${to}/${from}`,
    );

    const candles: Candle[] = (data.data?.candles ?? [])
      .map(([timestamp, open, high, low, close, volume]) => ({
        time: Math.floor(new Date(timestamp).getTime() / 1000),
        open,
        high,
        low,
        close,
        volume,
      }))
      .sort((left, right) => left.time - right.time);

    await cacheSet(cacheKey, candles, CACHE_TTL_HISTORY);
    res.json(candles);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[history/${indexName}/${rawRange}]`, message);
    res.status(502).json({ error: "Upstox API error", detail: message });
  }
});

const io = new SocketIOServer(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("subscribe", (indexName: string) => {
    if (!isValidIndex(indexName)) {
      return;
    }

    socket.join(indexName);
    console.log(`Socket ${socket.id} subscribed to ${indexName}`);
  });

  socket.on("unsubscribe", (indexName: string) => {
    socket.leave(indexName);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

let upstoxWs: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function buildWsUrl(): string {
  const keys = Object.values(INSTRUMENT_KEYS).join(",");
  return `wss://api.upstox.com/v3/feed/market-data-feed?instrument_keys=${encodeURIComponent(keys)}`;
}

function scheduleReconnect(): void {
  if (reconnectTimer || !ACCESS_TOKEN) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectUpstoxWs();
  }, 5000);
  reconnectTimer.unref?.();
}

function connectUpstoxWs(): void {
  if (!ACCESS_TOKEN) {
    return;
  }

  upstoxWs?.terminate();
  upstoxWs = null;

  console.log("Connecting to Upstox market data feed...");

  upstoxWs = new WebSocket(buildWsUrl(), {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });

  upstoxWs.on("open", () => {
    console.log("Upstox WebSocket connected");
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  upstoxWs.on("message", (raw: Buffer) => {
    try {
      const message = JSON.parse(raw.toString("utf8")) as UpstoxFeedMessage;

      for (const [instrumentKey, feedData] of Object.entries(message.feeds ?? {})) {
        const indexName = keyToIndexName(instrumentKey);
        if (!indexName) {
          continue;
        }

        const marketData = feedData.ff?.marketFF ?? feedData.ff?.indexFF;
        const ltpc = marketData?.ltpc;
        const ohlc = marketData?.dayOHLC;

        if (!ltpc?.ltp) {
          continue;
        }

        const previousClose = ltpc.cp ?? ohlc?.close ?? 0;
        const quote: Quote = {
          ltp: ltpc.ltp,
          open: ohlc?.open ?? 0,
          high: ohlc?.high ?? 0,
          low: ohlc?.low ?? 0,
          close: previousClose,
          change: ltpc.ltp - previousClose,
          changePct: previousClose ? Number((((ltpc.ltp - previousClose) / previousClose) * 100).toFixed(2)) : 0,
          volume: marketData?.vtt ?? 0,
          timestamp: Date.now(),
        };

        void cacheSet(`quote:${indexName}`, quote, CACHE_TTL_QUOTE);
        io.to(indexName).emit("quote", { indexName, quote });
      }
    } catch {
      // Ignore non-JSON frames.
    }
  });

  upstoxWs.on("close", (code: number) => {
    console.warn(`Upstox WebSocket closed (${code}). Reconnecting in 5 seconds.`);
    scheduleReconnect();
  });

  upstoxWs.on("error", (error: Error) => {
    console.error("Upstox WebSocket error:", error.message);
  });
}

function shutdown(signal: string): void {
  console.log(`${signal} received. Shutting down gracefully.`);

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  upstoxWs?.terminate();
  redis.disconnect();
  io.close();
  httpServer.close(() => process.exit(0));
}

await connectRedis();
connectUpstoxWs();

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

httpServer.listen(PORT, () => {
  console.log(
    `StockGraphy proxy listening on http://localhost:${PORT} (client origin: ${CLIENT_ORIGIN})`,
  );
});
