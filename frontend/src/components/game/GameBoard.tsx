import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import Opponents from "./Opponents";
import HistoryModal from "./HistoryModal";
import "./GameBoard.css";

const GameBoard: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  // Pasiimame duomenis iš Store
  const {
    myCards,
    playCard,
    discardPile,
    usedCards,
    setHistoryOpen,
    drawCard,
    finishTurn,
    isGameStarted,
    opponents,
    connectToRoom,
    sendStartSignal,
    deckCount, // <-- Nauja: skaičių gauname iš serverio
    socket, // <-- Nauja: reikia atpažinti save
  } = useGameStore();

  useEffect(() => {
    if (roomId) {
      connectToRoom(roomId);
    }
  }, [roomId, connectToRoom]);

  // Kaladės sluoksnių vizualizacija dabar priklauso nuo serverio deckCount
  const visualLayers = Math.min(Math.floor(deckCount / 4), 12);

  return (
    <div className="game-board">
      {/* 1. VIRŠUTINĖ JUOSTA (Matome kitus žaidėjus) */}
      {/* <Opponents /> */}

      {/* 2. LOBBY LANGAS (Rodomas kol žaidimas neprasidėjo) */}
      {!isGameStarted && (
        <div className="start-overlay">
          <div className="start-box">
            <h2>Kambarys: {roomId}</h2>
            <div className="lobby-info">
              <p>Prisijungę žaidėjai: {opponents.length}</p>
              <div className="player-list-lobby">
                {opponents.map((opp) => (
                  <div key={opp.id} className="player-badge">
                    {/* Tikriname ar šitas žaidėjas yra "Aš" pagal socket ID */}
                    {opp.username} {opp.id === socket?.id ? "(Tu)" : ""}
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

      {/* ŽAIDIMO STALAS */}
      <div className={`table-center ${!isGameStarted ? "blur" : ""}`}>
        <div className="cards-row">
          <AnimatePresence mode="popLayout">
            {discardPile.map((card, index) => {
              // SURANDAME VARDĄ:
              // Jei owner === 'player', tai Tu.
              // Jei owner === 'opponent', ieškome oponento vardo pagal jo ID (kurį gavome iš serverio)
              let displayUsername = "Tu";

              if (card.owner === "opponent") {
                // Ieškome oponento objekto mūsų opponents sąraše pagal senderId
                // (SVARBU: Serveryje PlayCard evente turėjai pridėti senderId prie kortos objekto)
                const opp = opponents.find((o) => o.id === card.senderId);
                displayUsername = opp ? opp.username : "Priešininkas";
              }

              return (
                <motion.div
                  key={card.instanceId || card.id}
                  className={`table-card-container ${card.owner || "player"}`}
                  initial={{
                    opacity: 0,
                    y: card.owner === "opponent" ? -300 : 300,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotate: index % 2 === 0 ? 2 : -2,
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  style={{ zIndex: index }}
                >
                  {/* ČIA PAKEIČIAME ETIKETĘ */}
                  <div className="owner-label">{displayUsername}</div>

                  <div className={`glow-wrapper ${card.owner || "player"}`}>
                    <Card {...card} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. TAVO RANKA (Kortos, kurias laikai) */}
      <div
        className={`player-hand-container ${!isGameStarted ? "hidden" : ""}`}
      >
        <div className="player-hand-label">Tavo kortos ({myCards.length})</div>
        <div className="player-hand">
          <AnimatePresence>
            {myCards.map((card, index) => (
              <motion.div
                key={card.id}
                className="hand-card-wrapper"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                whileHover={{ y: -20, scale: 1.05 }}
                onClick={() => playCard(card.id)} // Paspaudus - išmeta kortą
                style={{
                  zIndex: index,
                  marginLeft: index === 0 ? 0 : "-40px", // Kortos šiek tiek užkloja viena kitą
                }}
              >
                <Card {...card} />
              </motion.div>
            ))}
          </AnimatePresence>
          {myCards.length === 0 && isGameStarted && (
            <div className="empty-hand-msg">
              Neturi kortų. Trauk iš kaladės!
            </div>
          )}
        </div>
      </div>

      {/* ŠONINIS PANELIS (Kaladė ir veiksmai) */}
      <div className="side-panel">
        <button
          className={`finish-turn-btn ${discardPile.length > 0 ? "active" : ""}`}
          onClick={finishTurn}
          disabled={!isGameStarted || discardPile.length === 0}
        >
          Baigti ėjimą
        </button>

        <div className="pile-group">
          {/* Svarbu: Rodome skaičių, kurį atsiuntė serveris */}
          <span className="pile-label">Kaladė ({deckCount})</span>
          <div className="deck-container">
            <div
              className="deck-pile"
              onClick={() => isGameStarted && drawCard()}
              style={{ "--layers": visualLayers } as any}
            >
              {deckCount > 0 ? (
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
                {usedCards.slice(-3).map((card, index) => (
                  <div
                    key={`${card.id}-${index}`}
                    className="stacked-card-layer"
                    style={{
                      position: "absolute",
                      top: `-${index * 2}px`,
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

      <HistoryModal />
    </div>
  );
};

export default GameBoard;
