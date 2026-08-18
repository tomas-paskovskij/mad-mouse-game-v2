import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryEntry {
  id: string;
  type: string;
  time: string;
  msg: string;
}

interface HistoryPanelProps {
  showHistory: boolean;
  history: HistoryEntry[];
  histRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  showHistory,
  history,
  histRef,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {showHistory && (
        <motion.div
          className="history-panel"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
        >
          <div className="history-header">
            <span>📜 Istorija</span>
            <button className="overlay-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="history-list" ref={histRef}>
            {history.length === 0 && <p className="empty-note">Nėra įvykių</p>}
            {history.map((e) => (
              <div key={e.id} className={`hist-entry hist-entry--${e.type}`}>
                <span className="hist-time">{e.time}</span>
                <span className="hist-msg">{e.msg}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
