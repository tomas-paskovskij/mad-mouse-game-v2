import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../../store/useGameStore";

export const TrapMenu: React.FC = () => {
  // Store būsenos (PATAISYTA: naudojame trapActivating vietoj trapMenuTc)
  const trapActivating = useGameStore((s) => s.trapActivating);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const mySocketId = useGameStore((s) => s.mySocketId);
  const actionUsed = useGameStore((s) => s.actionUsed);
  const turnNumber = useGameStore((s) => s.turnNumber);

  // Store veiksmai (PATAISYTA: naudojame teisingus store veiksmus)
  const setTrapActivating = useGameStore((s) => s.setTrapActivating);
  const setTrapZoom = useGameStore(
    (s) =>
      (s as any).setTrapZoom ||
      (s as any).setZoomedCard ||
      (s as any).setSelectedCard ||
      (() => {}),
  );
  const activateTrap = useGameStore((s) => s.activateTrap);

  const isMyTurn = currentTurnPlayerId === mySocketId;

  // Tikriname ar korta gali būti aktyvuota
  const cardCanActivate =
    trapActivating?.card?.canActivate ?? trapActivating?.canActivate ?? true;

  const canActivate =
    Boolean(trapActivating) &&
    cardCanActivate &&
    isMyTurn &&
    !actionUsed &&
    trapActivating?.placedAtTurn !== turnNumber;

  const handleClose = () => setTrapActivating(null);

  const handleInspect = () => {
    if (!trapActivating) return;
    setTrapZoom(trapActivating);
    setTrapActivating(null);
  };

  const handleActivate = () => {
    if (!canActivate || !trapActivating) return;

    const tc = trapActivating;
    setTrapActivating(null);

    // Kviečiame serverio aktyvavimą
    activateTrap(tc.id);
  };

  const cardTitle =
    trapActivating?.title || trapActivating?.card?.title || "Spąstai";

  return (
    <AnimatePresence>
      {trapActivating && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <motion.div
            className="card-menu"
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1e1e1e",
              padding: "24px",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              position: "relative",
              minWidth: "280px",
            }}
          >
            <div className="trap-menu-header" style={{ textAlign: "center" }}>
              <span
                className="trap-menu-badge"
                style={{ display: "block", fontSize: "12px", color: "#f59e0b" }}
              >
                🪤 TRAP
              </span>
              <span
                className="trap-menu-title"
                style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}
              >
                {cardTitle}
              </span>
            </div>

            <div
              className="menu-actions"
              style={{ display: "flex", gap: "10px", width: "100%" }}
            >
              <button
                className="menu-btn menu-btn--inspect"
                onClick={handleInspect}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#334155",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                🔍 Peržiūrėti
              </button>

              <button
                className="menu-btn menu-btn--play"
                disabled={!canActivate}
                onClick={handleActivate}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  background: canActivate ? "#e11d48" : "#475569",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: canActivate ? "pointer" : "not-allowed",
                  opacity: canActivate ? 1 : 0.6,
                }}
              >
                ⚡ Aktyvuoti
              </button>
            </div>

            <button
              className="overlay-close"
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
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

export default TrapMenu;
