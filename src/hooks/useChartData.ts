import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  useIndexStore,
  type IndexId,
  type TimeRange,
  type Candle,
} from "@/store";

async function fetchCandles(
  indexId: IndexId,
  range: TimeRange
): Promise<Candle[]> {
  const res = await fetch(`/api/history/${indexId}?range=${range}`);
  if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);
  return res.json() as Promise<Candle[]>;
}

export function useChartData(indexId: IndexId, range: TimeRange) {
  const setCandles = useIndexStore((s) => s.setCandles);
  const cached = useIndexStore((s) => s.getCandles(indexId, range));

  const query = useQuery({
    queryKey:        ["candles", indexId, range],
    queryFn:         () => fetchCandles(indexId, range),
    staleTime:       range === "1D" ? 60_000 : 5 * 60_000,
    placeholderData: cached,
  });

  useEffect(() => {
    if (query.data) setCandles(indexId, range, query.data);
  }, [query.data, indexId, range, setCandles]);

  return query;
}
