// src/components/game/GameBoard.tsx
import React from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import "./GameBoard.css";

const GameBoard: React.FC = () => {
  return (
    <div className="game-board-area">
      <div className="deck-zone">
        <motion.div
          className="deck"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => console.log("Traukiama korta")}
        >
          {/* Užversta korta */}
          <div className="card back deck-top">MM</div>
          <div className="card back deck-shadow1"></div>
          <div className="card back deck-shadow2"></div>
        </motion.div>
        <span className="deck-label">Kaladė (45)</span>
      </div>

      <div className="discard-pile-zone">
        <div className="discard-pile">
          {/* Paskutinė išmesta korta */}
          <div className="discard-wrapper">
            <Card
              id="last"
              type="action"
              title="Pradžia"
              description="Sveiki atvykę į Mad Mouse! Traukite kortą."
            />
          </div>
        </div>
        <span className="discard-label">Išmesta korta</span>
      </div>
    </div>
  );
};

export default GameBoard;
