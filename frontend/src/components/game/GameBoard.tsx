import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import ReactionTimer from "./ReactionTimer";
import "./GameBoard.css";

const getRandom = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const GameBoard: React.FC = () => {
  const { myCards, discardPile, drawCard } = useGameStore();

  // 1. Kaladės likučio logika
  const totalCardsInDeck = 52;
  const cardsLeft = Math.max(
    0,
    totalCardsInDeck - (myCards.length + discardPile.length),
  );
  // Vizualinis sluoksnių kiekis (max 12 sluoksnių, kad neapkrautų naršyklės)
  const visualLayers = Math.min(Math.floor(cardsLeft / 4), 12);

  return (
    <div className="game-board">
      <div className="timer-wrapper">
        <ReactionTimer />
      </div>

      {/* CENTRAS: Išmestų kortų krūva */}
      <div className="table-center">
        {discardPile.length === 0 && (
          <div className="center-placeholder">Stalas</div>
        )}

        <AnimatePresence mode="popLayout">
          {discardPile.map((card, index) => {
            const randomRotation = getRandom(-15, 15);
            const randomX = getRandom(-15, 15);
            const randomY = getRandom(-15, 15);

            return (
              <motion.div
                key={card.id}
                initial={{
                  opacity: 0,
                  scale: 2,
                  y: 300,
                  rotate: randomRotation * 2,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: randomX,
                  y: randomY,
                  rotate: randomRotation,
                }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 18,
                  mass: 1,
                }}
                style={{
                  position: "absolute",
                  zIndex: index,
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                  pointerEvents: "none",
                }}
              >
                <Card {...card} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* DEŠINĖ: Kaladės ir informacija */}
      <div className="side-panel">
        <div className="pile-group">
          <span className="pile-label">Kaladė ({cardsLeft})</span>
          <motion.div
            className={`deck-pile ${cardsLeft === 0 ? "empty" : ""}`}
            onClick={cardsLeft > 0 ? drawCard : undefined}
            // Perduodame sluoksnių kiekį į CSS
            style={{ "--layers": visualLayers } as React.CSSProperties}
            whileHover={cardsLeft > 0 ? { scale: 1.05, y: -5 } : {}}
            whileTap={cardsLeft > 0 ? { scale: 0.95 } : {}}
          >
            {cardsLeft > 0 ? (
              <div className="card-back">MM</div>
            ) : (
              <div className="deck-empty-text">Tuščia</div>
            )}
          </motion.div>
        </div>

        <div className="pile-group">
          <span className="pile-label">Išmesta ({discardPile.length})</span>
          <div className="discard-slot-visual">
            <div className="empty-slot-icon">📥</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
