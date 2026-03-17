import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import cardsData from "../../data/cards.json";
import "./PlayerHand.css";

const PlayerHand: React.FC = () => {
  // Paimame pirmas 5 kortas iš JSON kaip pradinę ranką
  const [myCards, setMyCards] = useState(cardsData.slice(0, 5));

  const playCard = (id: string) => {
    // Animacija suveiks, nes naudojame AnimatePresence ir filter
    setMyCards((prev) => prev.filter((c) => c.id !== id));
  };

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
              exit={{ y: -200, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
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
      {/* Čia bus mygtukas iš 2 žingsnio */}
    </div>
  );
};

export default PlayerHand;
