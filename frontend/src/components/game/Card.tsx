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

// Unikalus art kiekvienai kortai pagal effect
const CARD_ART: Record<string, { emoji: string; bg: string; pattern: string }> =
  {
    // ACTION
    draw_two: {
      emoji: "🃏🃏",
      bg: "linear-gradient(135deg,#1a3a5c,#0d2137)",
      pattern: "dots",
    },
    draw_three: {
      emoji: "🃏🃏🃏",
      bg: "linear-gradient(135deg,#1a3a5c,#0d2137)",
      pattern: "dots",
    },
    shuffle_redistribute: {
      emoji: "🌀",
      bg: "linear-gradient(135deg,#1a1a4a,#0d0d2e)",
      pattern: "swirl",
    },
    skip_turn: {
      emoji: "⏭",
      bg: "linear-gradient(135deg,#3a1a1a,#1a0808)",
      pattern: "cross",
    },
    inspect_hand: {
      emoji: "🔍",
      bg: "linear-gradient(135deg,#1a3a2a,#0d1f17)",
      pattern: "dots",
    },
    force_draw_two: {
      emoji: "😤🃏",
      bg: "linear-gradient(135deg,#3a1a3a,#1a0d1a)",
      pattern: "cross",
    },
    all_draw_one: {
      emoji: "🤲",
      bg: "linear-gradient(135deg,#1a3a1a,#0d1f0d)",
      pattern: "dots",
    },
    force_discard: {
      emoji: "🗑️",
      bg: "linear-gradient(135deg,#3a2a1a,#1a1408)",
      pattern: "cross",
    },
    give_card: {
      emoji: "🎁",
      bg: "linear-gradient(135deg,#1a2a3a,#0d1520)",
      pattern: "dots",
    },
    return_draw_two: {
      emoji: "↩️🃏",
      bg: "linear-gradient(135deg,#1a3a3a,#0d1f1f)",
      pattern: "swirl",
    },
    pass_left: {
      emoji: "⬅️",
      bg: "linear-gradient(135deg,#2a1a3a,#150d1f)",
      pattern: "arrow",
    },
    pass_right: {
      emoji: "➡️",
      bg: "linear-gradient(135deg,#2a1a3a,#150d1f)",
      pattern: "arrow",
    },
    shuffle_draw: {
      emoji: "🔀🃏",
      bg: "linear-gradient(135deg,#1a2a3a,#0d1520)",
      pattern: "swirl",
    },
    tax_richest: {
      emoji: "💰",
      bg: "linear-gradient(135deg,#3a3a1a,#1f1f0d)",
      pattern: "dots",
    },
    help_poorest: {
      emoji: "🤝",
      bg: "linear-gradient(135deg,#1a3a2a,#0d1f17)",
      pattern: "dots",
    },
    amnesia: {
      emoji: "🌫️",
      bg: "linear-gradient(135deg,#2a2a2a,#141414)",
      pattern: "swirl",
    },
    double_turn: {
      emoji: "⚡⚡",
      bg: "linear-gradient(135deg,#3a3a1a,#1f1f0d)",
      pattern: "cross",
    },
    change_type: {
      emoji: "🎭",
      bg: "linear-gradient(135deg,#2a1a3a,#150d1f)",
      pattern: "swirl",
    },
    // STEAL
    steal_random_card: {
      emoji: "🗡️🧀",
      bg: "linear-gradient(135deg,#3a1a1a,#1a0808)",
      pattern: "cross",
    },
    swap_hands: {
      emoji: "🔄",
      bg: "linear-gradient(135deg,#1a2a3a,#0d1520)",
      pattern: "swirl",
    },
    inspect_steal: {
      emoji: "🔍🗡️",
      bg: "linear-gradient(135deg,#3a1a2a,#1a0815)",
      pattern: "dots",
    },
    mass_swap: {
      emoji: "🌀🔄",
      bg: "linear-gradient(135deg,#1a1a4a,#0d0d2e)",
      pattern: "swirl",
    },
    steal_all_one: {
      emoji: "🦹‍♂️",
      bg: "linear-gradient(135deg,#1a0808,#0d0404)",
      pattern: "cross",
    },
    // RESPONSE
    cancel_action: {
      emoji: "🚫",
      bg: "linear-gradient(135deg,#0d1a2e,#060f1a)",
      pattern: "cross",
    },
    reflect_action: {
      emoji: "↩️",
      bg: "linear-gradient(135deg,#0d1a2e,#060f1a)",
      pattern: "arrow",
    },
    shield: {
      emoji: "🛡️",
      bg: "linear-gradient(135deg,#0d1a2e,#060f1a)",
      pattern: "dots",
    },
    delay_action: {
      emoji: "⏱️",
      bg: "linear-gradient(135deg,#0d1a2e,#060f1a)",
      pattern: "dots",
    },
    // TRAP
    trap_steal_punish: {
      emoji: "🪤🐭",
      bg: "linear-gradient(135deg,#1a0a2e,#0a0618)",
      pattern: "cross",
    },
    trap_reflect: {
      emoji: "🪞",
      bg: "linear-gradient(135deg,#1a0a2e,#0a0618)",
      pattern: "swirl",
    },
    trap_lose_card: {
      emoji: "🪤💀",
      bg: "linear-gradient(135deg,#1a0a2e,#0a0618)",
      pattern: "cross",
    },
    trap_time_bomb: {
      emoji: "💣⏰",
      bg: "linear-gradient(135deg,#2a0a0a,#180404)",
      pattern: "cross",
    },
    trap_guard: {
      emoji: "🛡🪤",
      bg: "linear-gradient(135deg,#1a0a2e,#0a0618)",
      pattern: "dots",
    },
    trap_mimic: {
      emoji: "🎭🪤",
      bg: "linear-gradient(135deg,#1a0a2e,#0a0618)",
      pattern: "swirl",
    },
    // CURSE
    curse_skip_two: {
      emoji: "💀⏭",
      bg: "linear-gradient(135deg,#2a0808,#140404)",
      pattern: "cross",
    },
    curse_give_left: {
      emoji: "💀⬅️",
      bg: "linear-gradient(135deg,#2a0808,#140404)",
      pattern: "arrow",
    },
    curse_blind: {
      emoji: "👁️‍🗨️",
      bg: "linear-gradient(135deg,#2a0808,#140404)",
      pattern: "swirl",
    },
    curse_bad_draw: {
      emoji: "💀🃏",
      bg: "linear-gradient(135deg,#2a0808,#140404)",
      pattern: "cross",
    },
    curse_overload: {
      emoji: "💀🔥",
      bg: "linear-gradient(135deg,#2a0808,#140404)",
      pattern: "cross",
    },
  };

const DEFAULT_ART = {
  emoji: "🃏",
  bg: "linear-gradient(135deg,#1a1a2e,#0d0d1a)",
  pattern: "dots",
};

// SVG pattern backgrounds
const Pattern = ({ type, color }: { type: string; color: string }) => {
  if (type === "dots")
    return (
      <svg
        className="card-pattern"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="5" cy="5" r="1.5" fill={color} opacity="0.15" />
        <circle cx="15" cy="5" r="1.5" fill={color} opacity="0.15" />
        <circle cx="25" cy="5" r="1.5" fill={color} opacity="0.15" />
        <circle cx="35" cy="5" r="1.5" fill={color} opacity="0.15" />
        <circle cx="10" cy="15" r="1.5" fill={color} opacity="0.15" />
        <circle cx="20" cy="15" r="1.5" fill={color} opacity="0.15" />
        <circle cx="30" cy="15" r="1.5" fill={color} opacity="0.15" />
        <circle cx="5" cy="25" r="1.5" fill={color} opacity="0.15" />
        <circle cx="15" cy="25" r="1.5" fill={color} opacity="0.15" />
        <circle cx="25" cy="25" r="1.5" fill={color} opacity="0.15" />
        <circle cx="35" cy="25" r="1.5" fill={color} opacity="0.15" />
        <circle cx="10" cy="35" r="1.5" fill={color} opacity="0.15" />
        <circle cx="20" cy="35" r="1.5" fill={color} opacity="0.15" />
        <circle cx="30" cy="35" r="1.5" fill={color} opacity="0.15" />
      </svg>
    );
  if (type === "cross")
    return (
      <svg
        className="card-pattern"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.1"
        />
        <line
          x1="40"
          y1="0"
          x2="0"
          y2="40"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.1"
        />
        <line
          x1="20"
          y1="0"
          x2="20"
          y2="40"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.08"
        />
        <line
          x1="0"
          y1="20"
          x2="40"
          y2="20"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.08"
        />
      </svg>
    );
  if (type === "arrow")
    return (
      <svg
        className="card-pattern"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 20 L15 10 L15 16 L35 16 L35 24 L15 24 L15 30 Z"
          fill={color}
          opacity="0.08"
        />
      </svg>
    );
  // swirl
  return (
    <svg
      className="card-pattern"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 5 Q35 5 35 20 Q35 35 20 35 Q5 35 5 20 Q5 10 15 8"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.12"
      />
      <path
        d="M20 10 Q30 10 30 20 Q30 30 20 30 Q10 30 10 20 Q10 13 17 11"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.1"
      />
    </svg>
  );
};

const TYPE_ACCENT: Record<string, string> = {
  action: "#60a5fa",
  trap: "#a78bfa",
  response: "#34d399",
  curse: "#f87171",
};

const TYPE_LABEL: Record<string, string> = {
  action: "ACTION",
  trap: "TRAP",
  response: "RESPONSE",
  curse: "CURSE",
};

const Card: React.FC<CardProps> = ({
  instanceId,
  type,
  title,
  description,
  effect,
  isLightning,
  hidden,
  onClick,
}) => {
  if (hidden) {
    return (
      <div className="card card--hidden" onClick={onClick}>
        <div className="card-hidden-pattern">
          <span className="card-hidden-mouse">🐭</span>
        </div>
      </div>
    );
  }

  const art = CARD_ART[effect] || DEFAULT_ART;
  const accent = TYPE_ACCENT[type] || "#fff";

  return (
    <motion.div
      layoutId={instanceId}
      className={`card card--${type}`}
      style={{ background: art.bg }}
      onClick={onClick}
      whileHover={{ y: -12, scale: 1.05, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.94 }}
    >
      {/* Background pattern */}
      <Pattern type={art.pattern} color={accent} />

      {/* Top bar */}
      <div className="card-top">
        <div
          className="card-type-chip"
          style={{
            background: accent + "22",
            border: `1px solid ${accent}44`,
            color: accent,
          }}
        >
          {TYPE_LABEL[type]}
        </div>
        {isLightning && <span className="card-lightning">⚡</span>}
      </div>

      {/* Art area */}
      <div className="card-art">
        <div className="card-art-emoji">{art.emoji}</div>
        {/* Decorative corner mouse */}
        <div className="card-art-corner">🐭</div>
      </div>

      {/* Title */}
      <div className="card-title" style={{ color: accent }}>
        {title}
      </div>

      {/* Divider */}
      <div className="card-divider" style={{ background: accent + "44" }} />

      {/* Description */}
      <div className="card-desc">{description}</div>

      {/* Bottom glow */}
      <div className="card-bottom-glow" style={{ background: accent + "18" }} />
    </motion.div>
  );
};

export default Card;
