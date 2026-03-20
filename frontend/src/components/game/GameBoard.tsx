import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import ReactionTimer from "./ReactionTimer";
import "./GameBoard.css";

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
        <div className="cards-row">
          <AnimatePresence mode="popLayout">
            {discardPile.map((card, index) => (
              <motion.div
                key={card.id}
                className={`table-card-container ${card.owner || "player"}`}
                initial={{
                  opacity: 0,
                  y: card.owner === "opponent" ? -300 : 300,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotate: index % 2 === 0 ? 2 : -2,
                }}
                exit={{ opacity: 0, scale: 0.5, x: 100 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{ zIndex: index }}
              >
                <div className="owner-label">
                  {card.owner === "opponent" ? "Priešininkas" : "Tu"}
                </div>
                <div className={`glow-wrapper ${card.owner || "player"}`}>
                  <Card {...card} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
            <motion.div
              className={`deck-pile ${cardsLeft === 0 ? "empty" : ""}`}
              onClick={handleDraw}
              style={{ "--layers": visualLayers } as React.CSSProperties}
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
                {/* Paskutinė korta istorijoje taip pat turi savo glow */}
                <div
                  className={`glow-wrapper mini ${usedCards[usedCards.length - 1].owner || "player"}`}
                >
                  <Card {...usedCards[usedCards.length - 1]} />
                </div>
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
                    {/* PRIDĖTAS GLOW RĖMELIS ISTORIJOS GRID'E */}
                    <div
                      className={`history-card-item glow-wrapper ${card.owner || "player"}`}
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
                      {/* Padidinta korta su rėmeliu */}
                      <div
                        className={`glow-wrapper ${usedCards.find((c) => c.id === zoomedHistoryCard)?.owner || "player"}`}
                      >
                        <Card
                          {...usedCards.find(
                            (c) => c.id === zoomedHistoryCard,
                          )!}
                        />
                      </div>
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
