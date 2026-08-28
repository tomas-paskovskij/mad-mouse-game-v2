import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, TableCard } from "../../store/useGameStore";

export const ReactionWindow: React.FC = () => {
  // Store būsenos
  const rw = useGameStore((s) => s.reactionWindow);
  const secs = useGameStore((s) => s.reactionSecs);
  const turnNumber = useGameStore((s) => s.turnNumber);
  const mySocketId = useGameStore((s) => s.mySocketId);
  const tableCards = useGameStore((s) => s.tableCards) || [];
  const myCards = useGameStore((s) => s.handCards) || [];

  // Store veiksmai
  const passReaction = useGameStore((s) => s.passReaction);
  const playCard = useGameStore((s) => s.playCard);
  const activateTrap = useGameStore((s) => s.activateTrap);
  const setTrapActivating = useGameStore((s) => s.setTrapActivating);

  if (!rw) return null;

  // Filtruojame žaidėjo spąstus ant stalo, apsisaugodami nuo undefined elementų
  const myTraps = tableCards.filter((tc) => tc && tc.ownerId === mySocketId);

  const handleTrapClick = (tc: TableCard) => {
    if (!tc) return;
    if (tc.card?.requiresTarget) {
      setTrapActivating(tc);
    } else {
      activateTrap(tc.id);
    }
  };

  return (
    <AnimatePresence>
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
            transition={{
              duration: (rw.durationMs || 3000) / 1000,
              ease: "linear",
            }}
          />
        </div>
        <div className="reaction-btns">
          {myTraps
            .filter((tc) => tc && tc.placedAtTurn !== turnNumber)
            .map((tc) => (
              <button
                key={tc.id}
                className="rbtn rbtn--trap"
                onClick={() => handleTrapClick(tc)}
              >
                🪤 {tc.card?.title || "Spąstai"}
              </button>
            ))}
          {myCards
            .filter(
              (c) =>
                c &&
                c.isLightning &&
                (c.type === "interrupt" || c.type === "response"),
            )
            .map((c) => (
              <button
                key={c.instanceId}
                className="rbtn rbtn--interrupt"
                onClick={() => playCard(c.instanceId)}
              >
                🛡 {c.title || "Korta"}
              </button>
            ))}
          <button className="rbtn rbtn--pass" onClick={passReaction}>
            ⏭ Praleisti
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReactionWindow;
