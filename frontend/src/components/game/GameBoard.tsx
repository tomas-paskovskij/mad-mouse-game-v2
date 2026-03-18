import React from "react";
import { motion } from "framer-motion";
import ReactionTimer from "./ReactionTimer";
import { useGameStore } from "../../store/useGameStore";
import "./GameBoard.css";

const GameBoard: React.FC = () => {
  // Pasiimame drawCard funkciją tiesiai iš Zustand
  const drawCard = useGameStore((state) => state.drawCard);

  return (
    <div className="game-board">
      <div className="board-center">
        <div className="timer-wrapper">
          <ReactionTimer />
        </div>

        <div className="card-piles">
          {/* Kaladė (Deck) */}
          <motion.div
            className="deck-pile"
            onClick={drawCard} // Naudojame funkciją iš Zustand
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="card-back">MM</div>
            <span className="pile-label">Kaladė</span>
          </motion.div>

          {/* Išmesta korta (Discard Pile) */}
          <div className="discard-pile">
            <div className="discard-placeholder">
              <span className="pile-label">Išmesta korta</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
