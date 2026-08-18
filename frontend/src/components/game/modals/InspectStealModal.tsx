import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardType } from "../../../store/useGameStore";
import Card from "../Card";

interface InspectStealModalProps {
  inspectStealResult: {
    targetId: string;
    targetUsername: string;
    cards: CardType[];
  } | null;
  onPickCard: (targetId: string, cardInstanceId: string) => void;
  onClose: () => void;
}

export const InspectStealModal: React.FC<InspectStealModalProps> = ({
  inspectStealResult,
  onPickCard,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {inspectStealResult && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal modal--wide">
            <h3>🗡 {inspectStealResult.targetUsername}</h3>
            <div className="cards-scroll">
              {inspectStealResult.cards.map((c) => (
                <div
                  key={c.instanceId}
                  onClick={() =>
                    onPickCard(inspectStealResult.targetId, c.instanceId)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <Card {...c} />
                </div>
              ))}
            </div>
            <button className="btn-cancel" onClick={onClose}>
              Atšaukti
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
