import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";

export const TopBar: React.FC = () => {
  const players = useGameStore((s) => s.players) || [];
  const opponents = useGameStore((s) => s.opponents) || [];
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const mySocketId = useGameStore((s) => s.mySocketId);
  const actionUsed = useGameStore((s) => s.actionUsed);
  const storeSeconds = useGameStore((s) => (s as any).elapsedSeconds);
  const canDeclare = useGameStore((s) => (s as any).canDeclare) || false;

  const showHistory = useGameStore((s) => (s as any).showHistory);
  const setShowHistory = useGameStore((s) => (s as any).setShowHistory);
  const toggleHistory = useGameStore((s) => (s as any).toggleHistory);
  const declareMadMouse = useGameStore((s) => (s as any).declareMadMouse);

  const [localSeconds, setLocalSeconds] = useState(0);

  useEffect(() => {
    if (typeof storeSeconds === "number") {
      setLocalSeconds(storeSeconds);
      return;
    }

    const timer = setInterval(() => {
      setLocalSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [storeSeconds]);

  const isMyTurn = currentTurnPlayerId === mySocketId;

  const formatTime = (seconds: number) => {
    const totalSecs = Math.max(0, Math.floor(seconds || 0));
    const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const allPlayers = players.length > 0 ? players : opponents;
  const activePlayer = allPlayers.find((p) => p?.id === currentTurnPlayerId);
  const currentTurnName = activePlayer?.username || activePlayer?.name || "...";

  const handleHistoryClick = () => {
    if (typeof toggleHistory === "function") {
      toggleHistory();
    } else if (typeof setShowHistory === "function") {
      setShowHistory(!showHistory);
    } else {
      useGameStore.setState({ showHistory: !showHistory } as any);
    }
  };

  return (
    <header className="top-bar">
      <span className="top-round">Round 1</span>

      <div className={`turn-badge ${isMyTurn ? "turn-badge--mine" : ""}`}>
        {isMyTurn ? "Your turn" : currentTurnName}
        {isMyTurn && !actionUsed && <span className="ap-dot">⚡</span>}
      </div>

      <div className="side-btns">
        <button
          className="side-btn"
          onClick={handleHistoryClick}
          title="Istorija"
          style={{ cursor: "pointer" }}
        >
          📜
        </button>

        {canDeclare && declareMadMouse && (
          <motion.button
            className="side-btn side-btn--mm"
            onClick={declareMadMouse}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            🐭
          </motion.button>
        )}
      </div>

      <span className="top-timer">{formatTime(localSeconds)}</span>
    </header>
  );
};

export default TopBar;
