import React from "react";
import { motion } from "framer-motion";
import "./Card.css";

interface CardProps {
  id: string;
  instanceId: string;
  type: "action" | "trap" | "response" | "curse";
  title: string;
  description: string;
  effect: string;
  isLightning?: boolean;
  requiresTarget?: boolean;
  hidden?: boolean;
  onClick?: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  action: "⚡",
  trap: "🪤",
  response: "🛡",
  curse: "💀",
};

const Card: React.FC<CardProps> = ({
  id,
  instanceId,
  type,
  title,
  description,
  isLightning,
  hidden,
  onClick,
}) => {
  if (hidden) {
    return (
      <div className="card card--hidden">
        <div className="card__hidden-icon">?</div>
      </div>
    );
  }

  return (
    <motion.div
      layoutId={instanceId}
      className={`card card--${type}`}
      onClick={onClick}
      whileHover={{ y: -10, scale: 1.04, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="card__top">
        <div className="card__dot" />
        {isLightning && <span className="card__lightning">⚡</span>}
      </div>
      <div className="card__icon">{TYPE_ICONS[type] || "🃏"}</div>
      <div className="card__title">{title}</div>
      <div className="card__desc">{description}</div>
      <div className="card__bottom">
        <span className="card__type-label">{type}</span>
      </div>
    </motion.div>
  );
};

export default Card;
