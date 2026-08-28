import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../../store/useGameStore";
import Card from "../Card";

export const ZoomOverlay: React.FC = () => {
  // Pasiimame būsenas iš Zustand
  const zoomCard = useGameStore((s) => s.zoomCard);
  const trapZoom = useGameStore((s) => s.trapZoom);

  // Uždarymo veiksmai
  const setZoomCard = useGameStore((s) => s.setZoomCard);
  const setTrapZoom = useGameStore((s) => s.setTrapZoom);

  const handleClose = () => {
    if (zoomCard) setZoomCard(null);
    if (trapZoom) setTrapZoom(null);
  };

  return (
    <AnimatePresence>
      {(zoomCard || trapZoom) && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="zoom-wrap"
            initial={{ scale: 0.5 }}
            animate={{ scale: 2.55 }}
            exit={{ scale: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {zoomCard && <Card {...zoomCard} />}
            {trapZoom && <Card {...trapZoom.card} instanceId={trapZoom.id} />}

            <button className="overlay-close" onClick={handleClose}>
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
