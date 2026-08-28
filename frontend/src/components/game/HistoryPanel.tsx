import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";

export const HistoryPanel: React.FC = () => {
  const showHistory = useGameStore((s) => (s as any).showHistory);
  const history = useGameStore((s) => (s as any).history) || [];
  const setShowHistory = useGameStore((s) => (s as any).setShowHistory);

  const histRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showHistory && histRef.current) {
      histRef.current.scrollTop = histRef.current.scrollHeight;
    }
  }, [history, showHistory]);

  const handleClose = () => {
    if (typeof setShowHistory === "function") {
      setShowHistory(false);
    } else {
      useGameStore.setState({ showHistory: false } as any);
    }
  };

  return (
    <AnimatePresence>
      {showHistory && (
        <motion.div
          className="history-panel"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            width: "320px",
            maxHeight: "100vh",
            background: "#0f172a",
            borderLeft: "1px solid #334155",
            zIndex: 1100,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-5px 0 25px rgba(0,0,0,0.5)",
            padding: "16px",
          }}
        >
          <div
            className="history-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #334155",
              paddingBottom: "12px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontWeight: "bold", color: "#f8fafc" }}>
              📜 Istorija
            </span>
            <button
              className="overlay-close"
              onClick={handleClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <div
            className="history-list"
            ref={histRef}
            style={{
              overflowY: "auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {history.length === 0 ? (
              <p
                className="empty-note"
                style={{ color: "#64748b", fontStyle: "italic" }}
              >
                Nėra įvykių
              </p>
            ) : (
              history.map((e: any, index: number) => (
                <div
                  key={e.id || index}
                  className={`hist-entry hist-entry--${e.type || "default"}`}
                  style={{
                    background: "#1e293b",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#e2e8f0",
                    borderLeft: "3px solid #3b82f6",
                  }}
                >
                  <span
                    className="hist-time"
                    style={{
                      color: "#64748b",
                      fontSize: "10px",
                      marginRight: "6px",
                    }}
                  >
                    {e.time}
                  </span>
                  <span className="hist-msg">{e.msg || e.message}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HistoryPanel;
