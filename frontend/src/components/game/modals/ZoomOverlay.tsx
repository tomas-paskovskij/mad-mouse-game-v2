import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardType, TableCard } from "../../../store/useGameStore";
import Card from "../Card";

interface ZoomOverlayProps {
  zoomCard: CardType | null;
  trapZoom: TableCard | null;
  onClose: () => void;
}

export const ZoomOverlay: React.FC<ZoomOverlayProps> = ({
  zoomCard,
  trapZoom,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {(zoomCard || trapZoom) && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="zoom-wrap"
            initial={{ scale: 0.5 }}
            animate={{ scale: 2.55 }}
            exit={{ scale: 0.5 }}
          >
            {zoomCard && <Card {...zoomCard} />}
            {trapZoom && <Card {...trapZoom.card} instanceId={trapZoom.id} />}

            <button className="overlay-close" onClick={onClose}>
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
