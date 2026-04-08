import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useIndexStore, type IndexId, type Quote } from "@/store";

async function fetchQuote(indexId: IndexId): Promise<Quote> {
  const res = await fetch(`/api/quote/${indexId}`);
  if (!res.ok) throw new Error(`Quote fetch failed: ${res.status}`);
  return res.json() as Promise<Quote>;
}

export function useIndexQuote(indexId: IndexId) {
  const setQuote = useIndexStore((s) => s.setQuote);

  const query = useQuery({
    queryKey:       ["quote", indexId],
    queryFn:        () => fetchQuote(indexId),
    refetchInterval: 25_000,
    staleTime:       20_000,
  });

  useEffect(() => {
    if (query.data) setQuote(indexId, query.data);
  }, [query.data, indexId, setQuote]);

  return query;
}
