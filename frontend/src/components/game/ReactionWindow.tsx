import React from "react";
import { motion } from "framer-motion";
import type { CardType, TableCard } from "../../store/useGameStore";

interface ReactionWindowProps {
  rw: any;
  secs: number;
  myTraps: TableCard[];
  myCards: CardType[];
  turnNumber: number;
  onPass: () => void;
  onPlayCard: (id: string) => void;
  onTrapReaction: (id: string, targetId?: string) => void;
  onSetTrapActivating: (tc: TableCard) => void;
}

export const ReactionWindow: React.FC<ReactionWindowProps> = ({
  rw,
  secs,
  myTraps,
  myCards,
  turnNumber,
  onPass,
  onPlayCard,
  onTrapReaction,
  onSetTrapActivating,
}) => (
  <motion.div
    className="reaction-panel"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 20, opacity: 0 }}
  >
    <div className="reaction-header">
      <span className="reaction-title">⚡ Reakcijos laikas!</span>
      <span
        className={`reaction-secs ${secs <= 2 ? "reaction-secs--urgent" : ""}`}
      >
        {secs}s
      </span>
    </div>
    <div className="reaction-card-name">{rw.card?.title || "Veiksmas"}</div>
    <div className="reaction-progress-track">
      <motion.div
        className="reaction-progress-fill"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: rw.durationMs / 1000, ease: "linear" }}
      />
    </div>
    <div className="reaction-btns">
      {myTraps
        .filter((tc) => tc.placedAtTurn !== turnNumber)
        .map((tc) => (
          <button
            key={tc.id}
            className="rbtn rbtn--trap"
            onClick={() =>
              tc.card.requiresTarget
                ? onSetTrapActivating(tc)
                : onTrapReaction(tc.id)
            }
          >
            🪤 {tc.card.title}
          </button>
        ))}
      {myCards
        .filter(
          (c) =>
            c.isLightning && (c.type === "interrupt" || c.type === "response"),
        )
        .map((c) => (
          <button
            key={c.instanceId}
            className="rbtn rbtn--interrupt"
            onClick={() => onPlayCard(c.instanceId)}
          >
            🛡 {c.title}
          </button>
        ))}
      <button className="rbtn rbtn--pass" onClick={onPass}>
        ⏭ Praleisti
      </button>
    </div>
  </motion.div>
);
