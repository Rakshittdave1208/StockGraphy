import { useEffect } from "react";
import { io } from "socket.io-client";
import { INDEX_IDS, useIndexStore, type IndexId, type Quote } from "@/store";

interface QuoteEventPayload {
  indexName: IndexId;
  quote: Quote;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export function useSocket() {
  const ingestLiveQuote = useIndexStore((state) => state.ingestLiveQuote);
  const setSocketConnected = useIndexStore((state) => state.setSocketConnected);

  useEffect(() => {
    const socket = io(SOCKET_URL || undefined, {
      path: "/socket.io",
      reconnection: true,
    });

    const subscribeToIndices = () => {
      setSocketConnected(true);

      for (const indexId of INDEX_IDS) {
        socket.emit("subscribe", indexId);
      }
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleQuote = ({ indexName, quote }: QuoteEventPayload) => {
      ingestLiveQuote(indexName, quote);
    };

    socket.on("connect", subscribeToIndices);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleDisconnect);
    socket.on("quote", handleQuote);

    return () => {
      handleDisconnect();
      socket.off("connect", subscribeToIndices);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleDisconnect);
      socket.off("quote", handleQuote);
      socket.close();
    };
  }, [ingestLiveQuote, setSocketConnected]);
}
