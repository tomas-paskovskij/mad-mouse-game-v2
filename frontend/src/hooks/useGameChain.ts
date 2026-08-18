import { useState, useRef, useEffect } from "react";
import { socket } from "../services/socket";
import type { CardType } from "../store/useGameStore";

export interface ChainEntry {
  id: number;
  card: CardType;
  playerName: string;
  playerId: string;
  isTrap?: boolean;
}

export function useGameChain() {
  const [chain, setChain] = useState<ChainEntry[]>([]);
  const [stageActive, setStageActive] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);

  const stageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = (ch: ChainEntry[], idx: number) => {
    if (stageTimer.current) clearTimeout(stageTimer.current);

    stageTimer.current = setTimeout(() => {
      setChain((prev) => {
        if (idx + 1 < prev.length) {
          setStageIdx(idx + 1);
          scheduleNext(prev, idx + 1);
        } else {
          setStageActive(false);
        }
        return prev;
      });
    }, 5000);
  };

  const stageDone = () => {
    if (stageTimer.current) clearTimeout(stageTimer.current);

    setChain((prev) => {
      if (stageIdx + 1 < prev.length) {
        const nextIdx = stageIdx + 1;
        setStageIdx(nextIdx);
        scheduleNext(prev, nextIdx);
      } else {
        setStageActive(false);
      }
      return prev;
    });
  };

  useEffect(() => {
    const onPlayed = (data: {
      card: CardType;
      playerName: string;
      playerId: string;
      isTrap?: boolean;
    }) => {
      const entry: ChainEntry = { id: Date.now(), ...data };

      setChain((prev) => {
        const next = [...prev, entry];

        if (!stageActive) {
          setStageActive(true);
          setStageIdx(next.length - 1);
          scheduleNext(next, next.length - 1);
        }

        return next;
      });
    };

    const onClear = () => {
      if (stageTimer.current) clearTimeout(stageTimer.current);
      setChain([]);
      setStageActive(false);
      setStageIdx(0);
    };

    socket.on("card_played_display", onPlayed);
    socket.on("turn_chain_clear", onClear);

    return () => {
      socket.off("card_played_display", onPlayed);
      socket.off("turn_chain_clear", onClear);
    };
  }, [stageActive]);

  return { chain, stageActive, stageIdx, stageDone };
}
