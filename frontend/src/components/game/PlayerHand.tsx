import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore"; // Svarbu!
import Card from "./Card";
import "./PlayerHand.css";

const PlayerHand: React.FC = () => {
  // Pasiimame duomenis ir funkcijas tiesiai iš Zustand
  const myCards = useGameStore((state) => state.myCards);
  const playCard = useGameStore((state) => state.playCard);

  const isMadMouseReady = myCards.length >= 3;

  return (
    <div className="player-hand-wrapper">
      <div className="hand-container">
        <AnimatePresence mode="popLayout" initial={false}>
          {myCards.map((card) => (
            <motion.div
              key={card.id}
              layout="position"
              initial={{ opacity: 0, scale: 0.3, y: -400, rotate: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{
                opacity: 0,
                scale: 0.5,
                y: -150,
                transition: { duration: 0.2 },
              }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="card-slot"
            >
              <Card {...card} onClick={() => playCard(card.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="controls-area">
        <motion.button
          className={`mad-mouse-btn ${isMadMouseReady ? "active" : ""}`}
          animate={isMadMouseReady ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          MAD MOUSE ({myCards.length}/10)
        </motion.button>
      </div>
    </div>
  );
};

export default PlayerHand;
