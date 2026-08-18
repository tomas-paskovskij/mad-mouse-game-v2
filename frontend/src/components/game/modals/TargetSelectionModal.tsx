import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardType, Player, TableCard } from "../../../store/useGameStore";
import { Avatar } from "../Avatar";

interface TargetSelectionModalProps {
  needsTarget: CardType | TableCard | boolean | null;
  selectingTarget: CardType | null;
  actionNeedsTarget: TableCard | null;
  trapActivating: TableCard | null;
  otherPlayers: Player[];
  onSelectOpponent: (id: string) => void;
  onCancel: () => void;
}

export const TargetSelectionModal: React.FC<TargetSelectionModalProps> = ({
  needsTarget,
  selectingTarget,
  actionNeedsTarget,
  trapActivating,
  otherPlayers,
  onSelectOpponent,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {needsTarget && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal">
            <h3>Pasirink taikinį</h3>
            <p className="modal-sub">
              {selectingTarget?.title ||
                actionNeedsTarget?.card.title ||
                trapActivating?.card.title}
            </p>

            <div className="target-list">
              {otherPlayers.map((opp) => (
                <button
                  key={opp.id}
                  className="target-btn"
                  onClick={() => onSelectOpponent(opp.id)}
                >
                  <Avatar name={opp.username} size={26} />
                  <span>{opp.username}</span>
                  <span className="target-count">{opp.cardCount}🃏</span>
                </button>
              ))}
            </div>

            <button className="btn-cancel" onClick={onCancel}>
              Atšaukti
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
