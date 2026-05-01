import React from "react";
import { motion } from "framer-motion";
import GameBoard from "../components/game/GameBoard";
import "./GamePage.css";

const GamePage: React.FC = () => {
  return (
    <motion.div
      className="game-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <GameBoard />
    </motion.div>
  );
};

export default GamePage;
