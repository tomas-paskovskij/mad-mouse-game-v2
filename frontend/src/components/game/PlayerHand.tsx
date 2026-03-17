// src/components/game/PlayerHand.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import "./PlayerHand.css";

// Laikini duomenys testavimui
const initialCards = [
  {
    id: "1",
    type: "action",
    title: "Šokis",
    description: "Visi turi sušokti makareną.",
  },
  {
    id: "2",
    type: "counter",
    title: "STOP!",
    description: "Atšauk bet kokį veiksmą.",
  },
  {
    id: "3",
    type: "trap",
    title: "Spąstai",
    description: "Padėk užverstą. Jei kas prabils, praranda kortą.",
  },
];

const PlayerHand: React.FC = () => {
  // Motion variantai rankos animacijai (kai atsiranda)
  const containerVariants = {
    initial: { y: 200 },
    animate: { y: 0, transition: { staggerChildren: 0.1 } }, // Kortos atsiranda viena po kitos
  };

  const cardInHandVariants = {
    initial: { x: -500, rotate: -30, opacity: 0 },
    animate: {
      x: 0,
      rotate: 0,
      opacity: 1,
      transition: { type: "spring", damping: 15 },
    },
  };

  return (
    <div className="player-hand-area">
      <div className="player-info">
        <h3>Tavo ranka</h3>
        <button className="mad-mouse-btn">MAD MOUSE! (3/10)</button>
      </div>

      <motion.div
        className="hand-container"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence>
          {
            initialCards.map((card, index) => (
              <motion.div
                key={card.id}
                className="card-wrapper"
                variants={cardInHandVariants}
                style={{
                  // Sukuriame ventiliatoriaus efektą
                  zIndex: index,
                  rotate: (index - initialCards.length / 2) * 5,
                  x: (index - initialCards.length / 2) * 10,
                }}
              >
                <Card
                  {...card}
                  onClick={() => console.log("Išmesta korta:", card.title)}
                />
              </motion.div>
            )) as any
          }{" "}
          {/* any reikalingas dėl TS ir Framer Motion AnimatePresence sąveikos */}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PlayerHand;
