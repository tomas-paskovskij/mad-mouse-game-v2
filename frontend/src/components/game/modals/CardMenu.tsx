import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../Card";
import { useGameStore, CardType } from "../../../store/useGameStore";

export const CardMenu: React.FC = () => {
  const selectedCard = useGameStore((s) => s.selectedCard) as CardType | null;
  const turnNumber = useGameStore((s) => s.turnNumber);
  const players = useGameStore((s) => s.players) || [];
  const mySocketId = useGameStore((s) => s.mySocketId);

  const setSelectedCard = useGameStore((s) => s.setSelectedCard);
  const playCard = useGameStore((s) => s.playCard);
  const mulligan = useGameStore((s) => s.mulligan);
  const giveCardToPlayer = useGameStore((s) => s.giveCardToPlayer);

  // Būsena kortos padidinimui ir atidavimo meniu
  const [isZoomed, setIsZoomed] = useState(false);
  const [showGiveDropdown, setShowGiveDropdown] = useState(false);

  // Kiti žaidėjai (priešininkai)
  const opponents = players.filter((p) => p.id !== mySocketId);

  const handleClose = () => {
    setIsZoomed(false);
    setShowGiveDropdown(false);
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
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <motion.div
            className="card-menu"
            initial={{ scale: 0.85, y: 20 }}
            animate={{
              scale: isZoomed ? 1.3 : 1,
              y: 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1e1e1e",
              padding: "20px",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
              position: "relative",
              maxWidth: "90vw",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div>
              <Card {...selectedCard} />
            </div>

            {/* Mygtukai rodomi tik tada, kai korta NĖRA priartinta */}
            {!isZoomed ? (
              <div
                className="menu-actions"
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  maxWidth: "320px",
                }}
              >
                <button
                  className="menu-btn menu-btn--inspect"
                  onClick={() => setIsZoomed(true)}
                  style={{
                    padding: "8px 12px",
                    background: "#3b82f6",
                    color: "#fff",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  🔍 Padidinti
                </button>

                <button
                  className="menu-btn menu-btn--play"
                  onClick={handlePlay}
                  style={{
                    padding: "8px 12px",
                    background: "#22c55e",
                    color: "#fff",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ▶ Panaudoti
                </button>

                {/* Atiduoti žaidėjui mygtukas ir išskleidžiamas sąrašas */}
                <div style={{ position: "relative", width: "100%" }}>
                  <button
                    onClick={() => setShowGiveDropdown(!showGiveDropdown)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "#6366f1",
                      color: "#fff",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>🎁 Duoti žaidėjui</span>
                    <span>{showGiveDropdown ? "▲" : "▼"}</span>
                  </button>

                  {showGiveDropdown && (
                    <div
                      style={{
                        marginTop: "5px",
                        background: "#0f172a",
                        border: "1px solid #4f46e5",
                        borderRadius: "8px",
                        padding: "5px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        maxHeight: "120px",
                        overflowY: "auto",
                      }}
                    >
                      {opponents.length === 0 ? (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          Nėra kitų žaidėjų
                        </span>
                      ) : (
                        opponents.map((opp) => (
                          <button
                            key={opp.id}
                            onClick={() => handleGive(opp.id)}
                            style={{
                              textAlign: "left",
                              padding: "6px 8px",
                              background: "#1e293b",
                              color: "#fff",
                              borderRadius: "4px",
                              border: "none",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            {opp.username || opp.name || opp.id}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {selectedCard.type === "trap" && (
                  <button
                    className="menu-btn menu-btn--trap"
                    onClick={handlePlaceTrap}
                    style={{
                      padding: "8px 12px",
                      background: "#eab308",
                      color: "#000",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    🪤 Padėti ant stalo
                  </button>
                )}

                {turnNumber === 1 && (
                  <button
                    className="menu-btn menu-btn--mulligan"
                    onClick={handleMulligan}
                    style={{
                      padding: "8px 12px",
                      background: "#a855f7",
                      color: "#fff",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    🔀 Mulligan
                  </button>
                )}

                <button
                  className="menu-btn menu-btn--discard"
                  onClick={handleDiscard}
                  style={{
                    padding: "8px 12px",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  🗑 Išmesti
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsZoomed(false)}
                style={{
                  padding: "6px 16px",
                  background: "#475569",
                  color: "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                ◀ Grįžti į meniu
              </button>
            )}

            <button
              className="overlay-close"
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CardMenu;
