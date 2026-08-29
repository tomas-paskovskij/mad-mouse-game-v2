import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../../store/useGameStore";
import { Avatar } from "../Avatar";

export const TargetSelectionModal: React.FC = () => {
  // Store būsenos
  const selectingTarget = useGameStore((s) => s.selectingTarget);
  const actionNeedsTarget = useGameStore((s) => s.actionNeedsTarget);
  const trapActivating = useGameStore((s) => s.trapActivating);
  const players = useGameStore((s) => s.players) || [];
  const mySocketId = useGameStore((s) => s.mySocketId);

  // Store veiksmai
  const setSelectingTarget = useGameStore((s) => s.setSelectingTarget);
  const setActionNeedsTarget = useGameStore((s) => s.setActionNeedsTarget);
  const setTrapActivating = useGameStore((s) => s.setTrapActivating);
  const playCard = useGameStore((s) => s.playCard);
  const activateTrap = useGameStore((s) => s.activateTrap);

  // Kiti žaidėjai (priešininkai)
  const otherPlayers = players.filter((p) => p.id !== mySocketId);

  // Tikriname, ar reikia rodyti modalą
  const needsTarget = selectingTarget || actionNeedsTarget || trapActivating;

  if (!needsTarget) return null;

  const handleCancel = () => {
    setSelectingTarget(null);
    setActionNeedsTarget(null);
    setTrapActivating(null);
  };

  const handleSelectOpponent = (targetId: string) => {
    if (selectingTarget) {
      playCard(selectingTarget.instanceId, targetId);
      setSelectingTarget(null);
    } else if (trapActivating) {
      activateTrap(trapActivating.id, targetId);
      setTrapActivating(null);
    } else if (actionNeedsTarget) {
      // Jei turite specialų veiksmą su stalo korta
      setActionNeedsTarget(null);
    }
  };

  return (
    <AnimatePresence>
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
                onClick={() => handleSelectOpponent(opp.id)}
              >
                <Avatar name={opp.username} size={26} />
                <span>{opp.username}</span>
                <span className="target-count">{opp.cardCount}🃏</span>
              </button>
            ))}
          </div>

          <button className="btn-cancel" onClick={handleCancel}>
            Atšaukti
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TargetSelectionModal;
