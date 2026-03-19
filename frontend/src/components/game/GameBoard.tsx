import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import ReactionTimer from "./ReactionTimer";
import "./GameBoard.css";

const getRandom = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const GameBoard: React.FC = () => {
  const {
    myCards,
    discardPile,
    usedCards,
    isHistoryOpen,
    setHistoryOpen,
    selectedHistoryCard,
    setSelectedHistoryCard,
    zoomedHistoryCard,
    setZoomedHistoryCard,
    drawCard,
    finishTurn,
  } = useGameStore();

  const [drawingTrigger, setDrawingTrigger] = useState(0);

  // Skaičiuojame tūrį kaladei (max 12 sluoksnių)
  const totalCardsInDeck = 52;
  const cardsLeft = Math.max(
    0,
    totalCardsInDeck - (myCards.length + discardPile.length + usedCards.length),
  );
  const visualLayers = Math.min(Math.floor(cardsLeft / 4), 12);

  const handleDraw = () => {
    if (cardsLeft > 0 && myCards.length < 10) {
      drawCard();
      setDrawingTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="game-board">
      <div className="timer-wrapper">
        <ReactionTimer />
      </div>

      <div className="table-center">
        <AnimatePresence mode="popLayout">
          {discardPile.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 1.5, y: 200 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: index * 2,
                y: index * -2,
                rotate: getRandom(-5, 5),
              }}
              exit={{ x: 600, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ position: "absolute", zIndex: index }}
            >
              <Card {...card} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="side-panel">
        <button
          className={`finish-turn-btn ${discardPile.length > 0 ? "active" : ""}`}
          onClick={finishTurn}
          disabled={discardPile.length === 0}
        >
          Baigti ėjimą
        </button>

        <div className="pile-group">
          <span className="pile-label">Kaladė ({cardsLeft})</span>
          <div className="deck-container">
            {/* SUGRAŽINTAS 3D STILIUS PER visualLayers */}
            <motion.div
              className={`deck-pile ${cardsLeft === 0 ? "empty" : ""}`}
              onClick={handleDraw}
              style={{ "--layers": visualLayers } as React.CSSProperties}
              whileHover={cardsLeft > 0 ? { scale: 1.05 } : {}}
              whileTap={cardsLeft > 0 ? { scale: 0.95 } : {}}
            >
              {cardsLeft > 0 ? (
                <div className="card-back">MM</div>
              ) : (
                <div className="deck-empty-text">Pabaiga</div>
              )}
            </motion.div>

            <AnimatePresence>
              {drawingTrigger > 0 && (
                <motion.div
                  key={drawingTrigger}
                  className="flying-card-back"
                  initial={{ opacity: 1, x: 0, y: 0 }}
                  animate={{ opacity: 0, x: -200, y: 500, rotate: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  MM
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="pile-group">
          <span className="pile-label">Istorija ({usedCards.length})</span>
          <div
            className="discard-slot-visual clickable"
            onClick={() => usedCards.length > 0 && setHistoryOpen(true)}
          >
            {usedCards.length > 0 ? (
              <div className="used-card-preview-wrapper">
                <Card {...usedCards[usedCards.length - 1]} />
              </div>
            ) : (
              <div className="empty-slot-icon">📥</div>
            )}
            <div className="hover-overlay">👁️ Peržiūrėti</div>
          </div>
        </div>
      </div>

      {/* ISTORIJOS OVERLAY */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            className="history-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHistoryOpen(false)}
          >
            <div
              className="history-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="history-header">
                <h2>Kortų istorija</h2>
                <button
                  className="close-btn"
                  onClick={() => setHistoryOpen(false)}
                >
                  Uždaryti
                </button>
              </div>

              <div
                className="history-grid"
                onClick={() => setSelectedHistoryCard(null)}
              >
                {usedCards.map((card) => (
                  <div key={card.id} className="history-card-container">
                    <div
                      className="history-card-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHistoryCard(card.id);
                      }}
                    >
                      <Card {...card} />

                      <AnimatePresence>
                        {selectedHistoryCard === card.id && (
                          <motion.div
                            className="card-options-menu"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                          >
                            <button
                              onClick={() => setZoomedHistoryCard(card.id)}
                            >
                              🔍 Padidinti
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {zoomedHistoryCard && (
                  <motion.div
                    className="zoom-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setZoomedHistoryCard(null)}
                  >
                    <motion.div
                      className="zoomed-card-box"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1.5 }}
                    >
                      <Card
                        {...usedCards.find((c) => c.id === zoomedHistoryCard)}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard;
