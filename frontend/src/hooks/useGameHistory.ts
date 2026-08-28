import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

export function useGameHistory() {
  const notification = useGameStore((s) => s.notification);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!notification) return;

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

  return { flash };
}
