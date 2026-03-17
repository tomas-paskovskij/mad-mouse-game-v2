import React from "react";
import { motion } from "framer-motion";
import ReactionTimer from "./ReactionTimer";
import "./GameBoard.css";

// 1. Pridedame interfeisą, kad komponentas žinotų apie onDraw prop'są
interface GameBoardProps {
  onDraw?: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onDraw }) => {
  return (
    <div className="game-board">
      <div className="board-center">
        <div className="timer-wrapper">
          <ReactionTimer />
        </div>

        <div className="card-piles">
          {/* 2. Paverčiame į motion.div ir pridedame onClick={onDraw} */}
          <motion.div
            className="deck-pile"
            onClick={onDraw}
            whileHover={{ scale: 1.05, y: -5 }} // Vizualus feedback
            whileTap={{ scale: 0.95 }} // Paspaudimo feedback
          >
            <div className="card-back">MM</div>
            <span className="pile-label">Kaladė</span>
          </motion.div>

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
