import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../Card";
import { useGameStore } from "../../../store/useGameStore";

export const InspectModal: React.FC = () => {
  // Paimame duomenis ir veiksmus tiesiai iš Store
  const inspectResult = useGameStore((s) => (s as any).inspectResult);
  const setInspectResult = useGameStore((s) => (s as any).setInspectResult);

  const handleClose = () => {
    if (setInspectResult) {
      setInspectResult(null);
    }
  };

  return (
    <AnimatePresence>
      {inspectResult && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <motion.div
            className="modal modal--wide"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1e293b",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "90vw",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              border: "1px solid #334155",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Antraštė */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #334155",
                paddingBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px" }}>
                🔍 {inspectResult.targetUsername || "Žaidėjo"} kortos
              </h3>
              <button
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Kortų sąrašas */}
            <div
              className="cards-scroll"
              style={{
                display: "flex",
                gap: "16px",
                overflowX: "auto",
                padding: "12px 4px",
                alignItems: "center",
                minHeight: "220px",
              }}
            >
              {inspectResult.cards && inspectResult.cards.length > 0 ? (
                inspectResult.cards.map((c: any, index: number) => (
                  <div
                    key={c.instanceId || `inspect-card-${index}`}
                    style={{ flexShrink: 0 }}
                  >
                    <Card {...c} />
                  </div>
                ))
              ) : (
                <div
                  style={{
                    color: "#94a3b8",
                    fontStyle: "italic",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  Šis žaidėjas neturi kortų.
                </div>
              )}
            </div>

            {/* Apatinis mygtukas */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn-cancel"
                onClick={handleClose}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  background: "#475569",
                  color: "#fff",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Uždaryti
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InspectModal;
