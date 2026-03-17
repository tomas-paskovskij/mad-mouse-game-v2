// src/components/game/Card.tsx
import React from "react";
import { motion } from "framer-motion";
import "./Card.css";

interface CardProps {
  id: string;
  type: "action" | "counter" | "trap"; // Kortos tipas
  title: string;
  description: string;
  isFaceUp?: boolean; // Ar korta atversta (mums - visada true, kitiems - false)
  onClick?: () => void; // Funkcija, kai paspaudžiame
}

const Card: React.FC<CardProps> = ({
  type,
  title,
  description,
  isFaceUp = true,
  onClick,
}) => {
  // Motion variantai hover efektui
  const cardVariants = {
    initial: { scale: 1, y: 0, rotateY: 180 }, // Jei būtų užversta
    animate: { scale: 1, y: 0, rotateY: 0 }, // Atsiverčia
    hover: {
      scale: 1.1,
      y: -15, // Pakyla į viršų
      boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className={`card ${type} ${!isFaceUp ? "back" : ""}`}
      variants={cardVariants}
      initial="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {isFaceUp ? (
        <div className="card-content">
          <div className="card-header">
            <span className="card-title">{title}</span>
            <span className="card-type-icon"></span>
          </div>
          <p className="card-description">{description}</p>
        </div>
      ) : (
        <div className="card-back">MM</div> // Mad Mouse logotipas ant nugarėlės
      )}
    </motion.div>
  );
};

export default Card;
