import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import ReactionTimer from "./ReactionTimer";
import Opponents from "./Opponents"; // Importuojame naują komponentą
import HistoryModal from "./HistoryModal"; // Importuojame istorijos modalą
import "./GameBoard.css";

const GameBoard: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const {
    myCards,
    discardPile,
    usedCards,
    setHistoryOpen,
    drawCard,
    finishTurn,
    isGameStarted,
    opponents,
    connectToRoom,
    sendStartSignal,
  } = useGameStore();

  useEffect(() => {
    if (roomId) {
      connectToRoom(roomId);
    }
  }, [roomId, connectToRoom]);

  const totalCardsInDeck = 52;
  const cardsLeft = Math.max(
    0,
    totalCardsInDeck - (myCards.length + discardPile.length + usedCards.length),
  );
  const visualLayers = Math.min(Math.floor(cardsLeft / 4), 12);

  return (
    <div className="game-board">
      {/* 1. VIRŠUTINĖ JUOSTA (VISI ŽAIDĖJAI) */}
      {/* <Opponents /> */}

      {/* 2. LOBBY OVERLAY */}
      {!isGameStarted && (
        <div className="start-overlay">
          <div className="start-box">
            <h2>Kambarys: {roomId}</h2>
            <div className="lobby-info">
              <p>Prisijungę žaidėjai: {opponents.length}</p>
              <div className="player-list-lobby">
                {opponents.map((opp) => (
                  <div key={opp.id} className="player-badge">
                    {opp.username} {opp.username === "www" ? "(Tu)" : ""}
                  </div>
                ))}
              </div>
            </div>
            <button className="big-start-btn" onClick={sendStartSignal}>
              Pradėti žaidimą
            </button>
          </div>
        </div>
      )}

      <div className="timer-wrapper">
        <ReactionTimer />
      </div>

      {/* ŽAIDIMO STALAS */}
      <div className={`table-center ${!isGameStarted ? "blur" : ""}`}>
        <div className="cards-row">
          <AnimatePresence mode="popLayout">
            {discardPile.map((card, index) => (
              <motion.div
                key={card.id}
                className={`table-card-container ${card.owner || "player"}`}
                initial={{
                  opacity: 0,
                  y: card.owner === "opponent" ? -300 : 300,
                }}
                animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 2 : -2 }}
                exit={{ opacity: 0, scale: 0.5 }}
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

      {/* ŠONINIS PANELIS */}
      <div className="side-panel">
        <button
          className={`finish-turn-btn ${discardPile.length > 0 ? "active" : ""}`}
          onClick={finishTurn}
          disabled={!isGameStarted || discardPile.length === 0}
        >
          Baigti ėjimą
        </button>

        <div className="pile-group">
          <span className="pile-label">Kaladė ({cardsLeft})</span>
          <div className="deck-container">
            <div
              className="deck-pile"
              onClick={() => isGameStarted && drawCard()}
              style={{ "--layers": visualLayers } as any}
            >
              {cardsLeft > 0 ? (
                <div className="card-back">MM</div>
              ) : (
                <div className="deck-empty">Pabaiga</div>
              )}
            </div>
          </div>
        </div>

        <div className="pile-group">
          <span className="pile-label">Istorija ({usedCards.length})</span>
          <div
            className="discard-slot-visual"
            onClick={() => usedCards.length > 0 && setHistoryOpen(true)}
          >
            {usedCards.length > 0 ? (
              <div className="stacked-cards">
                {/* Rodome paskutines 3 kortas kaip sluoksnius */}
                {usedCards.slice(-3).map((card, index) => (
                  <div
                    key={`${card.id}-${index}`}
                    className="stacked-card-layer"
                    style={{
                      position: "absolute",
                      top: `-${index * 2}px`, // Nedidelis poslinkis į viršų
                      zIndex: index,
                    }}
                  >
                    <Card {...card} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-slot">Tuščia</div>
            )}
          </div>
        </div>
      </div>

      {/* TAVO KORTOS APAČIOJE */}
      {/* <div className="my-hand-container">
        {myCards.map((card) => (
          <div key={card.id} className="hand-card-wrapper">
            <Card {...card} />
          </div>
        ))}
      </div> */}

      {/* MODALAI */}
      <HistoryModal />
    </div>
  );
};

export default GameBoard;
