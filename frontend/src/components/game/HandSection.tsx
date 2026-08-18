import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import type { CardType } from "../../store/useGameStore";

interface HandSectionProps {
  myCards: CardType[];
  onSelectCard: (card: CardType) => void;
}

export const HandSection: React.FC<HandSectionProps> = ({
  myCards,
  onSelectCard,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <section className="hand-section">
      <div className="hand-label">YOUR HAND ({myCards.length})</div>
      <div
        className="hand-carousel-container"
        ref={carouselRef}
        onWheel={handleWheel}
      >
        <div className="hand-cards-track">
          <AnimatePresence mode="popLayout">
            {myCards.map((card: any, i: number) => (
              <motion.div
                key={card.instanceId}
                layout
                className="hand-card-item"
                style={{
                  marginLeft: i === 0 ? 0 : "clamp(-1px, -1vw, -1px)",
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
                onClick={() => !card.hidden && onSelectCard(card)}
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

        {myCards.length === 0 && (
          <p className="hand-cards-empty">
            Rankoje nėra kortų — trauk iš kaladės!
          </p>
        )}
      </div>
    </section>
  );
};

export default HandSection;
