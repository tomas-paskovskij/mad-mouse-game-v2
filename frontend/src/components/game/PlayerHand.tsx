import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import cardsData from "../../data/cards.json";
import "./PlayerHand.css";

const PlayerHand: React.FC = () => {
  // Paimame kortas iš JSON
  const [myCards, setMyCards] = useState(cardsData.slice(0, 5));

  const playCard = (id: string) => {
    setMyCards((prev) => prev.filter((c) => c.id !== id));
  };

  // Sąlyga pulsavimui: pvz., jei turi bent 3 kortas (vėliau pakeisi į 10)
  const isMadMouseReady = myCards.length >= 3;

  return (
    <div className="player-hand-area">
      <div className="hand-container">
        <AnimatePresence>
          {myCards.map((card, index) => (
            <motion.div
              key={card.id}
              layoutId={card.id}
              initial={{ y: 150, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -250, opacity: 0, scale: 0.5, rotate: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="card-wrapper"
              style={{ zIndex: index }}
            >
              <Card
                {...card}
                type={card.type as any}
                onClick={() => playCard(card.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MAD MOUSE MYGTUKAS */}
      <div className="action-button-container">
        <motion.button
          className={`mad-mouse-btn ${isMadMouseReady ? "active" : ""}`}
          animate={
            isMadMouseReady
              ? {
                  scale: [1, 1.08, 1],
                  backgroundColor: ["#FFD700", "#FFF000", "#FFD700"],
                  boxShadow: [
                    "0px 0px 0px rgba(255, 215, 0, 0)",
                    "0px 0px 25px rgba(255, 215, 0, 0.6)",
                    "0px 0px 0px rgba(255, 215, 0, 0)",
                  ],
                }
              : { scale: 1 }
          }
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          onClick={() => isMadMouseReady && alert("MAD MOUSE!!!")}
        >
          <span className="btn-text">MAD MOUSE!</span>
          <span className="btn-count">{myCards.length}/10</span>
        </motion.button>
      </div>
    </div>
  );
};

export default PlayerHand;
