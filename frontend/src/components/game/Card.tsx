import React from "react";
import { motion } from "framer-motion";
import "./Card.css";

interface CardProps {
  id: string;
  type: "action" | "counter" | "trap";
  title: string;
  description: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  id,
  type,
  title,
  description,
  onClick,
}) => {
  return (
    <motion.div
      layoutId={id} // Šis ID turi sutapti su kortos ID iš cards.json
      className={`card ${type}`}
      onClick={onClick}
      whileHover={{
        y: -10,
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="card-inner">
        <div className="card-type-icon">
          {type === "action" && "🔥"}
          {type === "counter" && "🚫"}
          {type === "trap" && "🪤"}
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </motion.div>
  );
};

export default Card;
