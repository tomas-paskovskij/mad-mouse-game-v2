import React from "react";
import { motion } from "framer-motion";
import ReactionTimer from "./ReactionTimer"; // Importuojame naują komponentą
import Card from "./Card";
import "./GameBoard.css";

const GameBoard: React.FC = () => {
  return (
    <div className="game-board">
      {/* Centrinė zona: Kaladė ir Išmesta korta */}
      <div className="board-center">
        {/* LAIKMATIS: Atsiranda čia */}
        <div className="timer-wrapper">
          <ReactionTimer />
        </div>

        <div className="card-piles">
          {/* Kaladė (Deck) */}
          <div className="deck-pile">
            <div className="card-back">MM</div>
            <span className="pile-label">Kaladė</span>
          </div>

          {/* Išmesta korta (Discard Pile) */}
          <div className="discard-pile">
            {/* Čia vėliau bus paskutinė išmesta korta */}
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
