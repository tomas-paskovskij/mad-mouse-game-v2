import React from "react";
import { motion } from "framer-motion";
import { Avatar } from "../Avatar";

interface DiscardModalProps {
  pile: any[];
  onClose: () => void;
}

export const DiscardModal: React.FC<DiscardModalProps> = ({
  pile,
  onClose,
}) => {
  const colors: Record<string, string> = {
    action: "#4a7fd4",
    trap: "#a78bfa",
    interrupt: "#34d399",
    response: "#34d399",
    curse: "#f87171",
    goal: "#fbbf24",
  };

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal modal--wide"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Discard Pile History</h3>
          <button
            className="overlay-close overlay-close--inline"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="discard-list">
          {pile.length === 0 && (
            <p className="empty-note">Dar nėra išmestų kortų</p>
          )}
          {[...pile].reverse().map((card, i) => (
            <div key={`${card.instanceId}-${i}`} className="discard-row">
              <span className="discard-idx">{pile.length - i}</span>
              <span className="discard-time">{card.time || "--:--"}</span>
              <Avatar name={card.ownerUsername || "?"} size={20} />
              <span className="discard-who">{card.ownerUsername || "?"}</span>
              <span className="discard-verb">played</span>
              <span
                className="discard-card-name"
                style={{ color: colors[card.type] || "white" }}
              >
                {card.title}
              </span>
            </div>
          ))}
        </div>
        <button className="btn-cancel" onClick={onClose}>
          Uždaryti
        </button>
      </motion.div>
    </motion.div>
  );
};
