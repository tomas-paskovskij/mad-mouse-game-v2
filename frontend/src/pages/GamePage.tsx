import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameBoard from "../components/game/GameBoard";
import PlayerHand from "../components/game/PlayerHand";
import Scoreboard from "../components/game/Scoreboard";
import Opponents from "../components/game/Opponents";
import "./GamePage.css";

const GamePage: React.FC = () => {
  // Laikini duomenys vizualizacijai
  const [currentPlayer] = useState("Tomas");

  return (
    <motion.div
      className="game-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* VIRŠUS: Kiti žaidėjai */}
      <header className="game-header">
        <Opponents />
      </header>

      <main className="game-main-layout">
        {/* KAIRĖ: Rezultatai */}
        <aside className="game-sidebar">
          <Scoreboard />
        </aside>

        {/* VIDURYS: Stalas */}
        <section className="game-center">
          <div className="turn-indicator">
            Ėjimą atlieka: <span>{currentPlayer}</span>
          </div>
          <GameBoard />
        </section>
      </main>

      {/* APAČIA: Tavo kortos */}
      <footer className="game-footer">
        <PlayerHand />
      </footer>
    </motion.div>
  );
};

export default GamePage;
