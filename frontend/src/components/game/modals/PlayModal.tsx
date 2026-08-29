import React from "react";
import { motion } from "framer-motion";
import Card from "../Card";
import { Avatar } from "../Avatar";
import type { ChainEntry } from "../types";

interface PlayModalProps {
  entry: ChainEntry;
  chain: ChainEntry[];
  onSkip: () => void;
}

export const PlayModal: React.FC<PlayModalProps> = ({
  entry,
  chain,
  onSkip,
}) => (
  <motion.div
    className="play-modal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="play-modal-backdrop" />
    <div className="play-modal-inner">
      <div className="play-modal-who">
        <Avatar name={entry.playerName} size={28} />
        <span className="play-modal-who-name">{entry.playerName} played</span>
      </div>
      <motion.div
        initial={{ scale: 0.2, y: -120, rotate: -18, opacity: 0 }}
        animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.4, y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 13, stiffness: 160 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {entry.isTrap ? (
          <div className="play-modal-facedown">
            <span className="play-modal-facedown-q">?</span>
            <span className="play-modal-facedown-lbl">🪤 TRAP</span>
          </div>
        ) : (
          <div className="play-modal-card-wrap">
            <Card {...entry.card} instanceId={`modal-${entry.id}`} />
          </div>
        )}
      </motion.div>
      <div className="play-modal-timer-bar-wrap">
        <motion.div
          className="play-modal-timer-bar"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 4.5, ease: "linear" }}
        />
      </div>
    </div>
    <button className="skip-btn" onClick={onSkip}>
      Praleisti ▶
    </button>
  </motion.div>
);
