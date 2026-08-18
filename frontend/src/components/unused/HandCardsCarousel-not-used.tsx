import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const HandCardsCarousel = ({ myCards_, setMenuCard }: any) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Peliuko ratuko pavertimas į horizontalų scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      className="hand-carousel-container"
      ref={carouselRef}
      onWheel={handleWheel}
    >
      <div className="hand-cards-track">
        <AnimatePresence mode="popLayout">
          {myCards_.map((card: any, i: number) => (
            <motion.div
              key={card.instanceId}
              layout
              className="hand-card-item"
              style={{
                zIndex: i,
              }}
              initial={{ y: 80, opacity: 0, scale: 0.7 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -80, opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", damping: 18, stiffness: 200 }}
              whileHover={{
                y: -25,
                zIndex: 999,
                transition: { duration: 0.1 },
              }}
              onClick={() => !card.hidden && setMenuCard(card)}
            >
              {card.hidden ? (
                <div className="card-hidden-slot">?</div>
              ) : (
                <Card {...card} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {myCards_.length === 0 && (
        <p className="hand-cards-empty">
          Rankoje nėra kortų — trauk iš kaladės!
        </p>
      )}
    </div>
  );
};
