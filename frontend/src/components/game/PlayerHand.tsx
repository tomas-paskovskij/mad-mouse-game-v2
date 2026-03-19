import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import "./PlayerHand.css";

const PlayerHand: React.FC = () => {
  const { myCards, playCard } = useGameStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [zoomedCardId, setZoomedCardId] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    // Jei paspaudžiam tą pačią kortą - uždarom meniu, jei kitą - atidarom jai
    setSelectedCardId(selectedCardId === id ? null : id);
  };

  return (
    <div className="player-hand-container">
      <div className="player-hand">
        {myCards.map((card) => (
          <div key={card.id} className="card-wrapper">
            {/* VEIKSMŲ MENIU */}
            <AnimatePresence>
              {selectedCardId === card.id && (
                <motion.div
                  className="card-options"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -50 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <button onClick={() => setZoomedCardId(card.id)}>
                    🔍 Didinti
                  </button>
                  <button
                    onClick={() => {
                      playCard(card.id);
                      setSelectedCardId(null);
                    }}
                  >
                    🃏 Padėti
                  </button>
                  <button className="burn-btn">🔥 Išmesti</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div onClick={() => handleCardClick(card.id)}>
              <Card {...card} />
            </div>
          </div>
        ))}
      </div>

      {/* DIDINIMO MODALAS */}
      <AnimatePresence>
        {zoomedCardId && (
          <motion.div
            className="card-zoom-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedCardId(null)}
          >
            <motion.div
              className="zoomed-card"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1.5 }}
            >
              <Card {...myCards.find((c) => c.id === zoomedCardId)!} />
              <p className="zoom-hint">Spustelk bet kur, kad uždarytum</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerHand;
