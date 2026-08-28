import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../../store/useGameStore";
import { Avatar } from "../Avatar";

export const DiscardModal: React.FC = () => {
  // Store būsenos – naudojame nullish coalescing (?? []), kad niekada nebutų undefined
  const rawPile = useGameStore((s) => s.discardPile);
  const pile = Array.isArray(rawPile) ? rawPile : [];
  const showDiscard = useGameStore((s) => s.showDiscard);

  // Store veiksmas uždarymui
  const setShowDiscard = useGameStore((s) => s.setShowDiscard);

  if (!showDiscard) return null;

  const handleClose = () => setShowDiscard(false);

  const colors: Record<string, string> = {
    action: "#4a7fd4",
    trap: "#a78bfa",
    interrupt: "#34d399",
    response: "#34d399",
    curse: "#f87171",
    goal: "#fbbf24",
  };

  return (
    <AnimatePresence>
      <motion.div
        className="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="modal modal--wide"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>Discard Pile History ({pile.length})</h3>
            <button
              className="overlay-close overlay-close--inline"
              onClick={handleClose}
            >
              ✕
            </button>
          </div>

          <div className="discard-list">
            {pile.length === 0 && (
              <p className="empty-note">Dar nėra išmestų kortų</p>
            )}

            {[...pile].reverse().map((card, i) => {
              // Apsauga nuo neegzistuojančios kortos objekte
              if (!card) return null;

              const cardType = card.type || "action";
              const cardTitle = card.title || "Nežinoma korta";
              const instanceId = card.instanceId || `discard-idx-${i}`;

              return (
                <div key={`${instanceId}-${i}`} className="discard-row">
                  <span className="discard-idx">{pile.length - i}</span>
                  <span className="discard-time">{card.time || "--:--"}</span>
                  <Avatar name={card.ownerUsername || "?"} size={20} />
                  <span className="discard-who">
                    {card.ownerUsername || "?"}
                  </span>
                  <span className="discard-verb">played</span>
                  <span
                    className="discard-card-name"
                    style={{ color: colors[cardType] || "white" }}
                  >
                    {cardTitle}
                  </span>
                </div>
              );
            })}
          </div>

          <button className="btn-cancel" onClick={handleClose}>
            Uždaryti
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiscardModal;
