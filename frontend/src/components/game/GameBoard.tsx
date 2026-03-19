import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import ReactionTimer from "./ReactionTimer";
import "./GameBoard.css";

// Pagalbinė funkcija gauti atsitiktinį skaičių intervale
const getRandom = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const GameBoard: React.FC = () => {
  const drawCard = useGameStore((state) => state.drawCard);
  const discardPile = useGameStore((state) => state.discardPile);

  return (
    <div className="game-board">
      {/* Laikmatis viršuje */}
      <div className="timer-wrapper">
        <ReactionTimer />
      </div>

      {/* 3. CENTRAS: Netvarkinga išmestų kortų krūva */}
      <div className="table-center">
        {discardPile.length === 0 && (
          <div className="center-placeholder">Stalas</div>
        )}

        <AnimatePresence mode="popLayout">
          {discardPile.map((card, index) => {
            // Sukuriame unikalius nukrypimus šiai konkrečiai kortai,
            // bet tik vieną kartą (kai ji sukuriama), kad nemirksėtų perbraižant.
            // Kadangi 'key' yra unikalus, Framer Motion išlaikys šias reikšmes.
            const randomRotation = getRandom(-15, 15);
            const randomX = getRandom(-15, 15);
            const randomY = getRandom(-15, 15);

            return (
              <motion.div
                key={card.id}
                initial={{
                  opacity: 0,
                  scale: 2, // Korta atskrenda "iš didelio aukščio"
                  y: 300,
                  rotate: randomRotation * 2, // Pradinis pasukimas didesnis
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: randomX, // Galutinis nedidelis poslinkis X
                  y: randomY, // Galutinis nedidelis poslinkis Y
                  rotate: randomRotation, // Galutinis nedidelis pasukimas
                }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 18,
                  mass: 1, // Suteikia kortai "svorio" pojūtį
                }}
                style={{
                  position: "absolute",
                  // Svarbu gyliui: vėlesnės kortos (didesnis indeksas) turi didesnį zIndex
                  zIndex: index,
                  // Pridedame tikrovišką šešėlį
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.5)",
                  borderRadius: "12px", // Kad šešėlis atitiktų kortos formą
                  pointerEvents: "none", // Kad negalėtume netyčia paspausti apatinių kortų
                }}
              >
                <Card {...card} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 1 ir 2. DEŠINĖ: Kaladės */}
      <div className="side-panel">
        {/* Kaladė (Deck) */}
        <div className="pile-group">
          <span className="pile-label">Kaladė</span>
          <motion.div
            className="deck-pile"
            onClick={drawCard}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="card-back">MM</div>
          </motion.div>
        </div>

        {/* Paskutinė išmesta (Vizualus slotas) */}
        <div className="pile-group">
          <span className="pile-label">Krūva ({discardPile.length})</span>
          <div className="discard-slot-visual">
            <div className="empty-slot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
