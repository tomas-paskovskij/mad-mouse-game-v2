import React from "react";
import { motion } from "framer-motion";
import type { Player } from "../../store/useGameStore";

interface TopBarProps {
  isMyTurn: boolean;
  actionUsed: boolean;
  opponents: Player[];
  currentTurnPlayerId: string | null;
  canDeclare: boolean;
  elapsedSeconds: number;
  onToggleHistory: () => void;
  onDeclareMadMouse: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isMyTurn,
  actionUsed,
  opponents,
  currentTurnPlayerId,
  canDeclare,
  elapsedSeconds,
  onToggleHistory,
  onDeclareMadMouse,
}) => {
  const formatTime = (seconds: number) => {
    const totalSecs = Math.max(0, Math.floor(seconds || 0));
    const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const currentTurnName =
    opponents.find((o) => o.id === currentTurnPlayerId)?.username || "...";

  return (
    <header className="top-bar">
      <span className="top-round">Round 1</span>

      <div className={`turn-badge ${isMyTurn ? "turn-badge--mine" : ""}`}>
        {isMyTurn ? "Your turn" : currentTurnName}
        {isMyTurn && !actionUsed && <span className="ap-dot">⚡</span>}
      </div>

      <div className="side-btns">
        <button className="side-btn" onClick={onToggleHistory} title="Istorija">
          📜
        </button>

        {canDeclare && (
          <motion.button
            className="side-btn side-btn--mm"
            onClick={onDeclareMadMouse}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            🐭
          </motion.button>
        )}
      </div>

      <span className="top-timer">{formatTime(elapsedSeconds)}</span>
    </header>
  );
};
