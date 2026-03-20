import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import "./Opponents.css";

const Opponents: React.FC = () => {
  const { opponents, socket } = useGameStore(); // Pasiimame ir socket objektą

  return (
    <div className="opponents-wrapper">
      {opponents.length === 0 ? (
        <div className="no-opponents">Laukiama žaidėjų...</div>
      ) : (
        opponents.map((player) => (
          <motion.div
            key={player.id}
            // Pridedame specialią klasę, jei tai esi tu
            className={`opponent-card ${player.id === socket?.id ? "is-me" : ""}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="opponent-avatar">
              {player.id === socket?.id ? "⭐️" : "👤"}
            </div>
            <div className="opponent-info">
              <span className="name">
                {player.username} {player.id === socket?.id ? "(Tu)" : ""}
              </span>
              <span className="card-count">🎴 {player.cardCount || 0}</span>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default Opponents;
