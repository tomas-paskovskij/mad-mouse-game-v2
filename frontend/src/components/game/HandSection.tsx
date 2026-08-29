import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import { useGameStore, CardType } from "../../store/useGameStore";
import { CardSlider } from "../ui/CardSlider";

export const HandSection: React.FC = () => {
  // Store būsenos ir veiksmai
  const myCards = useGameStore((s) => s.handCards) || [];
  const selectCard = useGameStore((s) => s.selectCard || s.setSelectedCard);

  const handleCardClick = (card: CardType) => {
    if (!(card as any).hidden && selectCard) {
      selectCard(card);
    }
  };

  return (
    <section className="hand-section relative select-none w-full min-w-0">
      <div className="hand-label font-bold text-xs text-slate-400 mb-2">
        YOUR HAND ({myCards.length})
      </div>

      <div className="relative flex items-center w-full min-w-0">
        {myCards.length === 0 ? (
          <p className="hand-cards-empty text-center py-4 text-slate-400 w-full italic text-xs">
            Rankoje nėra kortų — trauk iš kaladės!
          </p>
        ) : (
          <CardSlider
            items={myCards}
            showSeparators={false}
            renderItem={(card: any, i: number) => (
              <AnimatePresence mode="popLayout" key={card.instanceId || i}>
                <motion.div
                  layout
                  className="hand-card-item shrink-0 cursor-pointer"
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
                  onClick={() => handleCardClick(card)}
                >
                  {card.hidden ? (
                    <div className="card-hidden-slot w-20 h-28 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-xl text-slate-400">
                      ?
                    </div>
                  ) : (
                    <Card {...card} />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          />
        )}
      </div>
    </section>
  );
};

export default HandSection;
