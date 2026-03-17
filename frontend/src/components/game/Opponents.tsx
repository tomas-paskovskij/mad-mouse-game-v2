import React from "react";
import { motion } from "framer-motion";
import "./Opponents.css";

const Opponents: React.FC = () => {
  const others = [
    { id: 1, name: "Giedrius", cards: 5, isTurn: false },
    { id: 2, name: "Aistė", cards: 3, isTurn: true },
    { id: 3, name: "Mantvydas", cards: 7, isTurn: false },
  ];

  return (
    <div className="opponents-wrapper">
      {others.map((player) => (
        <motion.div
          key={player.id}
          className={`opponent-card ${player.isTurn ? "active-turn" : ""}`}
          whileHover={{ y: 5 }}
        >
          <div className="opponent-avatar">👤</div>
          <div className="opponent-info">
            <span className="name">{player.name}</span>
            <span className="card-count">🎴 {player.cards}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Opponents;
