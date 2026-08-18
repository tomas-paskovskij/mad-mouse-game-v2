import React from "react";
import { motion } from "framer-motion";
import Card from "../Card";
import type { CardType } from "../../../store/useGameStore";

export const CardMenu: React.FC<{
  card: CardType;
  turnNumber: number;
  mulliganUsed: boolean;
  onPlay: () => void;
  onPlaceTrap: () => void;
  onDiscard: () => void;
  onInspect: () => void;
  onMulligan: () => void;
  onClose: () => void;
}> = ({
  card,
  turnNumber,
  mulliganUsed,
  onPlay,
  onPlaceTrap,
  onDiscard,
  onInspect,
  onMulligan,
  onClose,
}) => {
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
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 2, y: 0 }}
        exit={{ scale: 0.85 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <Card {...card} />
        </div>
        <div className="menu-actions">
          <button className="menu-btn menu-btn--inspect" onClick={onInspect}>
            🔍 Peržiūrėti
          </button>
          <button className="menu-btn menu-btn--play" onClick={onPlay}>
            ▶ Panaudoti
          </button>
          <button className="menu-btn menu-btn--trap" onClick={onPlaceTrap}>
            🪤 Padėti ant stalo
          </button>
          {turnNumber === 0 && !mulliganUsed && (
            <button
              className="menu-btn menu-btn--mulligan"
              onClick={onMulligan}
            >
              🔀 Mulligan
            </button>
          )}
          <button className="menu-btn menu-btn--discard" onClick={onDiscard}>
            🗑 Išmesti
          </button>
        </div>
        <button className="overlay-close" onClick={onClose}>
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
};

export default CardMenu;
