import React from "react";
import { motion } from "framer-motion";
import type { TableCard } from "../../../store/useGameStore";

interface TrapMenuProps {
  tc: TableCard;
  isMyTurn: boolean;
  actionUsed: boolean;
  turnNumber: number;
  onInspect: () => void;
  onActivate: () => void;
  onClose: () => void;
}

export const TrapMenu: React.FC<TrapMenuProps> = ({
  tc,
  isMyTurn,
  actionUsed,
  turnNumber,
  onInspect,
  onActivate,
  onClose,
}) => {
  const canActivate =
    tc.canActivate && isMyTurn && !actionUsed && tc.placedAtTurn !== turnNumber;

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card-menu"
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.85 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="trap-menu-header">
          <span className="trap-menu-badge">🪤 TRAP</span>
          <span className="trap-menu-title">{tc.card.title}</span>
        </div>
        <div className="menu-actions">
          <button className="menu-btn menu-btn--inspect" onClick={onInspect}>
            🔍 Peržiūrėti efektą
          </button>
          {canActivate && (
            <button className="menu-btn menu-btn--play" onClick={onActivate}>
              ⚡ Aktyvuoti
            </button>
          )}
          {tc.placedAtTurn === turnNumber && (
            <p className="cooldown-note">⏳ Galima aktyvuoti kitą ėjimą</p>
          )}
        </div>
        <button className="overlay-close" onClick={onClose}>
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
};
