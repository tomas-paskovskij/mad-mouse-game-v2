import React from "react";
import { motion } from "framer-motion";
import "./Card.css";

export interface CardProps {
  id?: string;
  instanceId: string;
  type?: "action" | "trap" | "response" | "interrupt" | "curse" | "goal";
  title?: string;
  description?: string;
  effect?: string;
  isLightning?: boolean;
  requiresTarget?: boolean;
  hidden?: boolean;
  isFlipped?: boolean;
  onClick?: () => void;
  compact?: boolean;
  card?: {
    type?: "action" | "trap" | "response" | "interrupt" | "curse" | "goal";
    title?: string;
    description?: string;
    effect?: string;
    isLightning?: boolean;
  };
}

const CARD_ART: Record<string, string> = {
  draw_two: "🫐🫐",
  draw_three: "🫐🫐🫐",
  shuffle_redistribute: "🌀",
  skip_turn: "🚫",
  inspect_hand: "🔍",
  force_draw_two: "🫐💢",
  all_draw_one: "🤲🫐",
  force_discard: "🗑️",
  give_card: "🎁",
  return_draw_two: "↩️🫐",
  pass_left: "⬅️🧁",
  pass_right: "🧁➡️",
  shuffle_draw: "🔀🫐",
  tax_richest: "💰",
  help_poorest: "🤝",
  amnesia: "🌫️",
  steal_random_card: "🗡️🫐",
  swap_hands: "🔄",
  inspect_steal: "🔍🗡️",
  mass_swap: "🌀🔄",
  steal_all_one: "🦹",
  cancel_action: "🚫⚡",
  reflect_action: "↩️⚡",
  shield: "🛡️",
  delay_action: "⏱️",
  trap_steal_punish: "🪤💢",
  trap_reflect: "🪞🪤",
  trap_lose_card: "🪤🗡️",
  trap_time_bomb: "💣⏰",
  trap_guard: "🛡️🪤",
  trap_mimic: "🎭🪤",
  curse_skip_two: "💀⏭️",
  curse_give_left: "💀⬅️",
  curse_blind: "👁️💀",
  curse_bad_draw: "💀🫐",
  curse_overload: "💀🔥",
  default: "🧁",
};

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  action: {
    label: "ACTION",
    color: "#1a3a6b",
    bg: "#e8f0fb",
    border: "#4a7fd4",
  },
  trap: { label: "TRAP", color: "#3d1a6e", bg: "#f0e8fb", border: "#7c4fd4" },
  interrupt: {
    label: "INTERRUPT",
    color: "#1a5c3a",
    bg: "#e8fbf0",
    border: "#4ad47c",
  },
  response: {
    label: "INTERRUPT",
    color: "#1a5c3a",
    bg: "#e8fbf0",
    border: "#4ad47c",
  },
  curse: { label: "CURSE", color: "#6b1a1a", bg: "#fbe8e8", border: "#d44a4a" },
  goal: { label: "GOAL", color: "#6b5a1a", bg: "#fbf5e8", border: "#d4b44a" },
};

const Card: React.FC<CardProps> = (props) => {
  const {
    instanceId,
    isLightning: directIsLightning,
    hidden = false,
    isFlipped = false,
    onClick,
    compact,
    card: innerCard,
  } = props;

  // Ištraukiame reikšmes: pirmenybė teikiama tiesioginiams props, jei jų nėra – imame iš props.card
  const type = props.type || innerCard?.type || "trap";
  const title = props.title || innerCard?.title || "Spąstai";
  const description = props.description || innerCard?.description || "";
  const effect = props.effect || innerCard?.effect || "";
  const isLightning = directIsLightning ?? innerCard?.isLightning;

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.action;
  const art = CARD_ART[effect] || CARD_ART.default;

  // Jei korta pažymėta kaip Paslėpta (hidden) ir nėra apversta
  const showBack = hidden && !isFlipped;

  return (
    <motion.div
      layoutId={instanceId}
      className={`card-wrapper ${compact ? "card-wrapper--compact" : ""}`}
      onClick={onClick}
      whileHover={
        !compact ? { y: -10, scale: 1.04, transition: { duration: 0.12 } } : {}
      }
      whileTap={{ scale: 0.95 }}
    >
      <div className={`card-inner ${showBack ? "is-flipped" : ""}`}>
        {/* PRIEKINĖ PUSĖ (Front) */}
        <div
          className={`card card--light card--${type} ${
            compact ? "card--compact" : ""
          }`}
          style={
            {
              "--card-color": cfg.color,
              "--card-bg": cfg.bg,
              "--card-border": cfg.border,
            } as any
          }
        >
          <div className="card-corner card-corner--tl" />
          <div className="card-corner card-corner--tr" />
          <div className="card-corner card-corner--bl" />
          <div className="card-corner card-corner--br" />

          <div className="card-top">
            <div
              className="card-type-badge"
              style={{ color: cfg.color, borderColor: cfg.border }}
            >
              {cfg.label}
            </div>
            {isLightning && <span className="card-lightning-badge">⚡</span>}
          </div>

          <div className="card-title-light" style={{ color: cfg.color }}>
            {title}
          </div>

          <div className="card-art-light">
            <div
              className="card-art-circle"
              style={{ background: cfg.bg, borderColor: cfg.border }}
            >
              <span className="card-art-emoji">{art}</span>
            </div>
          </div>

          <div
            className="card-divider-light"
            style={{ background: cfg.border + "44" }}
          />
          <div className="card-desc-light" style={{ color: cfg.color + "cc" }}>
            {description}
          </div>

          <div
            className="card-bottom-ornament"
            style={{ color: cfg.color + "33" }}
          >
            ✦
          </div>
        </div>

        {/* GALINĖ PUSĖ (Back) */}
        <div className="card card--back">
          <div className="card-hidden-bg">
            <div className="card-hidden-pattern" />
            <div className="card-back-inner-border">
              <span className="card-hidden-icon">✦</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
