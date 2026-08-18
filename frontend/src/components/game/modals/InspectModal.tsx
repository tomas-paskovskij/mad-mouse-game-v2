import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardType } from "../../../store/useGameStore";
import Card from "../Card";

interface InspectModalProps {
  inspectResult: { targetUsername: string; cards: CardType[] } | null;
  onClose: () => void;
}

export const InspectModal: React.FC<InspectModalProps> = ({
  inspectResult,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {inspectResult && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal modal--wide">
            <h3>🔍 {inspectResult.targetUsername}</h3>
            <div className="cards-scroll">
              {inspectResult.cards.map((c) => (
                <Card key={c.instanceId} {...c} />
              ))}
            </div>
            <button className="btn-cancel" onClick={onClose}>
              Uždaryti
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
