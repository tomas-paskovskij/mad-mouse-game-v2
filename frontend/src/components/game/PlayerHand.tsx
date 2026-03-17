import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import cardsData from "../../data/cards.json";
import "./PlayerHand.css";

const PlayerHand: React.FC = () => {
  // Pradinės kortos iš JSON
  const [myCards, setMyCards] = useState(cardsData.slice(0, 5));

  const playCard = (cardId: string) => {
    // Filtruojame tik tą vieną kortą pagal ID
    setMyCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const isMadMouseReady = myCards.length >= 3;

  return (
    <div className="player-hand-wrapper">
      <div className="hand-container">
        <AnimatePresence mode="popLayout" initial={false}>
          {myCards?.map((card) => (
            <motion.div
              key={card.id} // BŪTINAI įsitikink, kad cards.json faile ID yra unikalūs (pvz. "c1", "c2")
              layout="position" // Svarbu: neleidžia visai kortai persikrauti, tik juda vieta
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.5,
                y: -150,
                transition: { duration: 0.2 },
              }}
              className="card-slot"
            >
              <Card
                {...card}
                onClick={() => {
                  // Sustabdom bet kokį kitą veiksmą, kad nereaguotų fonas
                  setMyCards((prev) => prev.filter((c) => c.id !== card.id));
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mad Mouse Mygtukas */}
      <div className="controls-area">
        <motion.button
          className={`mad-mouse-btn ${isMadMouseReady ? "active" : ""}`}
          animate={
            isMadMouseReady
              ? {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0px 0px 0px #ffd700",
                    "0px 0px 20px #ffd700",
                    "0px 0px 0px #ffd700",
                  ],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 2 }}
        >
          MAD MOUSE ({myCards.length}/10)
        </motion.button>
      </div>
    </div>
  );
};

export default PlayerHand;
