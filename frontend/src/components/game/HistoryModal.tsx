import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import "./HistoryModal.css";

const HistoryModal: React.FC = () => {
  const { isHistoryOpen, setHistoryOpen, usedCards } = useGameStore();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  if (!isHistoryOpen) return null;

  return (
    <div
      className="history-modal-overlay"
      onClick={() => setHistoryOpen(false)}
    >
      <motion.div
        className="history-modal-content"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="history-header">
          <div className="header-text">
            <h2>Kortų istorija</h2>
            <p>{usedCards.length} panaudotos kortos</p>
          </div>
          <button className="close-btn" onClick={() => setHistoryOpen(false)}>
            ✕
          </button>
        </div>

        <div className="history-grid">
          {usedCards.length === 0 ? (
            <div className="empty-state">Istorija tuščia...</div>
          ) : (
            usedCards.map((card, index) => {
              const isExpanded = expandedCardId === card.id;

              return (
                <motion.div
                  layout
                  key={`${card.id}-${index}`}
                  className={`history-card-item ${isExpanded ? "is-expanded" : ""}`}
                  onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                >
                  <div className="card-zoom-container">
                    <Card {...card} />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="card-details-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        <h3 className="detail-title">Kortos Analizė</h3>
                        <div className="info-box">
                          <div className="info-row">
                            <span className="label">Žaidėjas:</span>
                            <span className="value">
                              {card.owner === "opponent"
                                ? "Priešininkas"
                                : "Tu (Host)"}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="label">Veiksmas:</span>
                            <span className="value">#{index + 1} ėjimas</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Tipas:</span>
                            <span className="value">
                              {card.suit} {card.value}
                            </span>
                          </div>
                          <p className="detail-desc">
                            Ši korta buvo panaudota žaidimo metu. Po paspaudimo
                            matote išplėstą informaciją su papildomais
                            nustatymais.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryModal;
