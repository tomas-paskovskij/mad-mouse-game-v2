import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../../store/useGameStore";
import Card from "../Card";

export const InspectStealModal: React.FC = () => {
  // Store būsena
  const inspectStealResult = useGameStore((s) => s.inspectStealResult);

  // Store veiksmai
  const setInspectStealResult = useGameStore((s) => s.setInspectStealResult);
  const pickStealCard = useGameStore((s) => s.pickStealCard);

  if (!inspectStealResult) return null;

  const handleClose = () => {
    setInspectStealResult(null);
  };

  const handlePickCard = (targetId: string, cardInstanceId: string) => {
    if (pickStealCard) {
      pickStealCard(targetId, cardInstanceId);
    }
    setInspectStealResult(null);
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
        <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
          <h3>🗡 {inspectStealResult.targetUsername}</h3>
          <div className="cards-scroll">
            {inspectStealResult.cards.map((c) => (
              <div
                key={c.instanceId}
                onClick={() =>
                  handlePickCard(inspectStealResult.targetId, c.instanceId)
                }
                style={{ cursor: "pointer" }}
              >
                <Card {...c} />
              </div>
            ))}
          </div>
          <button className="btn-cancel" onClick={handleClose}>
            Atšaukti
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InspectStealModal;
