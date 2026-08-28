import React from "react";
import { useGameStore } from "../../store/useGameStore";

interface AvatarProps {
  id?: string;
  name: string;
  size?: number;
  active?: boolean;
  isMe?: boolean;
  cardCount?: number;
  tableCardCount?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  id,
  name,
  size = 36,
  active,
  isMe,
  cardCount,
  tableCardCount,
}) => {
  // Pasiimame stalo kortas iš store (jei tableCardCount nebuvo perduotas tiesiogiai)
  const storeTableCards = useGameStore((state) => state.tableCards);

  // Jei tableCardCount neperduotas kaip props, suskaičiuojame patys pagal id
  const actualTableCount =
    tableCardCount !== undefined
      ? tableCardCount
      : id && storeTableCards
        ? storeTableCards.filter((tc) => tc.ownerId === id).length
        : 0;

  const initials = name?.slice(0, 2).toUpperCase() || "?";
  const palette = [
    "#4a7fd4",
    "#c084fc",
    "#f472b6",
    "#fb923c",
    "#34d399",
    "#f87171",
    "#60a5fa",
  ];
  const color = palette[(name?.charCodeAt(0) || 0) % palette.length];

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {/* Pagrindinis Avataro Apskritimas */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: isMe ? "#1d3a6e" : "#1e1b2e",
            border: `2px solid ${
              active ? "#4ade80" : isMe ? "#60a5fa" : "#2d2a45"
            }`,
            boxShadow: active
              ? "0 0 0 3px rgba(74,222,128,0.25)"
              : isMe
                ? "0 0 0 3px rgba(96,165,250,0.2)"
                : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.34,
            fontWeight: 800,
            color,
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          {initials}
        </div>

        {/* KAIRĖJE: Stalo kortų skaičius su ikona (rodomas tik jei > 0) */}
        {actualTableCount > 0 && (
          <div
            title={`Ant stalo: ${actualTableCount}`}
            style={{
              position: "absolute",
              top: -4,
              right: -15,
              background: "#d97706",
              color: "white",
              fontSize: "0.55rem",
              fontWeight: 900,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #0d0d1a",
              padding: "0 3px",
              gap: 1,
              zIndex: 10,
            }}
          >
            <span>{actualTableCount}</span>
            <span style={{ fontSize: "0.5rem" }}>🪤</span>
          </div>
        )}

        {/* DEŠINĖJE: Rankos kortų skaičius */}
        {cardCount !== undefined && (
          <div
            title={`Rankoje: ${cardCount}`}
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              background: "#1d4ed8",
              color: "white",
              fontSize: "0.48rem",
              fontWeight: 900,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #0d0d1a",
              padding: "0 3px",
              zIndex: 10,
            }}
          >
            {cardCount}
          </div>
        )}
      </div>
    </div>
  );
};
