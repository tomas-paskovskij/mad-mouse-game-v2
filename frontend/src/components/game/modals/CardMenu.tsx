import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../Card";
import { useGameStore, CardType } from "../../../store/useGameStore";

export const CardMenu: React.FC = () => {
  // Duomenys iš Zustand store
  const selectedCard = useGameStore((s) => s.selectedCard) as CardType | null;
  const turnNumber = useGameStore((s) => s.turnNumber);
  const players = useGameStore((s) => s.players) || [];
  const mySocketId = useGameStore((s) => s.mySocketId);

  // Store veiksmai
  const setSelectedCard = useGameStore((s) => s.setSelectedCard);
  const playCard = useGameStore((s) => s.playCard);
  const mulligan = useGameStore((s) => s.mulligan);
  const giveCardToPlayer = useGameStore((s) => s.giveCardToPlayer);

  // Vietinės būsenos
  const [isZoomed, setIsZoomed] = useState(false);
  const [showGiveMenu, setShowGiveMenu] = useState(false);

  // Filtruojame priešininkus (visi žaidėjai išskyrus mane)
  const opponents = players.filter((p) => p.id !== mySocketId);

  const handleClose = () => {
    setIsZoomed(false);
    setShowGiveMenu(false);
    setSelectedCard(null);
  };

  const handlePlay = () => {
    if (!selectedCard) return;
    const cardToPlay = selectedCard;
    handleClose();
    playCard(cardToPlay.instanceId);
  };

  const handlePlaceTrap = () => {
    if (!selectedCard) return;
    const cardToPlay = selectedCard;
    handleClose();
    playCard(cardToPlay.instanceId, undefined, { isTrap: true });
  };

  const handleDiscard = () => {
    if (!selectedCard) return;
    const cardToPlay = selectedCard;
    handleClose();
    playCard(cardToPlay.instanceId, undefined, { discard: true });
  };

  const handleMulligan = () => {
    handleClose();
    mulligan();
  };

  const handleGive = (targetPlayerId: string) => {
    if (!selectedCard) return;
    giveCardToPlayer(targetPlayerId, selectedCard.instanceId);
    handleClose();
  };

  return (
    <AnimatePresence>
      {selectedCard && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={`card-menu ${isZoomed ? "card-menu--zoomed" : ""}`}
            initial={{ scale: 0.85, y: 20 }}
            animate={{
              scale: isZoomed ? 2.35 : 1,
              y: 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <Card {...selectedCard} />
            </div>

            {/* Kai korta NĖRA priartinta */}
            {!isZoomed ? (
              <div className="menu-actions">
                {!showGiveMenu ? (
                  /* PAGRINDINIAI MYGTUKAI */
                  <>
                    <button
                      className="menu-btn menu-btn--inspect"
                      onClick={() => setIsZoomed(true)}
                    >
                      🔍 Padidinti
                    </button>

                    <button
                      className="menu-btn menu-btn--play"
                      onClick={handlePlay}
                    >
                      ▶ Panaudoti
                    </button>

                    <button
                      className="menu-btn menu-btn--give"
                      onClick={() => setShowGiveMenu(true)}
                    >
                      🎁 Perduoti žaidėjui...
                    </button>

                    {selectedCard.type === "trap" && (
                      <button
                        className="menu-btn menu-btn--trap"
                        onClick={handlePlaceTrap}
                      >
                        🪤 Padėti ant stalo
                      </button>
                    )}

                    {turnNumber === 1 && (
                      <button
                        className="menu-btn menu-btn--mulligan"
                        onClick={handleMulligan}
                      >
                        🔀 Mulligan
                      </button>
                    )}

                    <button
                      className="menu-btn menu-btn--discard"
                      onClick={handleDiscard}
                    >
                      🗑 Išmesti
                    </button>
                  </>
                ) : (
                  /* ŽAIDĖJŲ PASIRINKIMO MENIU (Pakeitė pasenusį Dropdown) */
                  <motion.div
                    className="give-picker-container"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="give-picker-header">
                      <span>Pasirinkite žaidėją:</span>
                    </div>

                    <div className="give-picker-list">
                      {opponents.length === 0 ? (
                        <div className="give-picker-empty">
                          Nėra kitų žaidėjų kambaryje
                        </div>
                      ) : (
                        opponents.map((opp) => (
                          <button
                            key={opp.id}
                            className="give-picker-item"
                            onClick={() => handleGive(opp.id)}
                          >
                            <span className="give-avatar">👤</span>
                            <span className="give-name">
                              {opp.username || opp.name || opp.id}
                            </span>
                          </button>
                        ))
                      )}
                    </div>

                    <button
                      className="menu-btn menu-btn--back"
                      onClick={() => setShowGiveMenu(false)}
                    >
                      ◀ Atšaukti
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              /* KAI KORTA PRIARTINTA */
              <button
                className="menu-btn menu-btn--back"
                onClick={() => setIsZoomed(false)}
              >
                ◀ Grįžti į meniu
              </button>
            )}

            <button className="overlay-close" onClick={handleClose}>
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CardMenu;
