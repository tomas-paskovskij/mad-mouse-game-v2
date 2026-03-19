import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import ReactionTimer from "./ReactionTimer";
import "./GameBoard.css";

const GameBoard: React.FC = () => {
  const drawCard = useGameStore((state) => state.drawCard);
  const discardPile = useGameStore((state) => state.discardPile);
  const topCard = discardPile[discardPile.length - 1];

  return (
    <div className="game-board">
      <div className="board-center">
        <div className="timer-wrapper">
          <ReactionTimer />
        </div>

        <div className="card-piles">
          {/* Kaladė */}
          <motion.div
            className="deck-pile"
            onClick={drawCard}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="card-back">MM</div>
            <span className="pile-label">Kaladė</span>
          </motion.div>

          {/* Išmesta korta */}
          <div className="discard-pile">
            <AnimatePresence mode="popLayout">
              {topCard ? (
                <motion.div
                  key={topCard.id}
                  initial={{ y: 150, opacity: 0, rotate: -20, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  style={{ position: "absolute" }}
                >
                  <Card {...topCard} />
                </motion.div>
              ) : (
                <div className="discard-placeholder">
                  <span className="pile-label">Mesk čia</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
