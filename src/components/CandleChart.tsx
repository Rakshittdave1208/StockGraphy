import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useChartData } from "@/hooks/useChartData";
import { type IndexId, type TimeRange } from "@/store";

interface CandleChartProps {
  indexId: IndexId;
  range: TimeRange;
}

export default function CandleChart({ indexId, range }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const renderedDataRef = useRef<CandlestickData<UTCTimestamp>[]>([]);

  const { data: candles, isLoading } = useChartData(indexId, range);

  const chartData: CandlestickData<UTCTimestamp>[] = (candles ?? []).map((candle) => ({
    time: candle.time as UTCTimestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }));

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#71717a",
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        vertLine: { color: "rgba(0,255,136,0.3)", labelBackgroundColor: "#00ff88" },
        horzLine: { color: "rgba(0,255,136,0.3)", labelBackgroundColor: "#00ff88" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.06)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: 380,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00ff88",
      downColor: "#ff4f4f",
      borderUpColor: "#00ff88",
      borderDownColor: "#ff4f4f",
      wickUpColor: "#00ff88",
      wickDownColor: "#ff4f4f",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) {
        return;
      }

      chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      renderedDataRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) {
      return;
    }

    const previousData = renderedDataRef.current;
    const previousLast = previousData[previousData.length - 1];
    const nextLast = chartData[chartData.length - 1];
    const shouldReset =
      previousData.length === 0 ||
      chartData.length === 0 ||
      chartData.length < previousData.length ||
      chartData.length - previousData.length > 1 ||
      previousData[0]?.time !== chartData[0]?.time;

    if (shouldReset) {
      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
      renderedDataRef.current = chartData;
      return;
    }

    if (nextLast && previousLast?.time === nextLast.time) {
      seriesRef.current.update(nextLast);
    } else if (nextLast) {
      seriesRef.current.update(nextLast);
      chartRef.current?.timeScale().scrollToRealTime();
    }

    renderedDataRef.current = chartData;
  }, [chartData]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
      {isLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-zinc-900">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00ff88] border-t-transparent" />
            <span className="font-mono text-xs text-zinc-600">Loading chart...</span>
          </div>
        </div>
      ) : null}

      <div ref={containerRef} className="h-103 w-full p-4" />
    </div>
  );
}
