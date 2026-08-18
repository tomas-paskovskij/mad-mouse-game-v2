import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";

export interface HistoryEntry {
  id: number;
  msg: string;
  type: string;
  time: string;
}

export function useGameHistory() {
  const notification = useGameStore((s) => s.notification);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const histRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notification) return;

    const time = new Date().toLocaleTimeString("lt-LT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setHistory((prev) => [
      ...prev.slice(-49),
      {
        id: Date.now(),
        msg: notification.message,
        type: notification.type,
        time,
      },
    ]);

    const emojiMap: Record<string, string> = {
      action: "⚡",
      trap: "🪤",
      interrupt: "🛡",
      response: "🛡",
      curse: "💀",
      turn: "▶",
      skip: "⏭",
      mad_mouse: "🐭",
    };

    setFlash(emojiMap[notification.type] || "⚡");
    const t = setTimeout(() => setFlash(null), 900);

    return () => clearTimeout(t);
  }, [notification]);

  useEffect(() => {
    if (histRef.current) {
      histRef.current.scrollTop = histRef.current.scrollHeight;
    }
  }, [history]);

  return { history, flash, histRef };
}
