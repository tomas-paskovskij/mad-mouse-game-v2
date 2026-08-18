import React from "react";
import type { TableCard } from "../../store/useGameStore";

interface TrapsSectionProps {
  trapCards?: TableCard[]; // Galima pasirenkama reiksme
  mySocketId: string | null;
  turnNumber: number;
  onSelectTrap: (tc: TableCard) => void;
}

export const TrapsSection: React.FC<TrapsSectionProps> = ({
  trapCards = [], // Numatytasis tuscias masyvas, jei perduodama undefined
  mySocketId,
  turnNumber,
  onSelectTrap,
}) => {
  return (
    <section className="middle-section">
      <div className="traps-area">
        <div className="section-label">TRAPS ON TABLE (FACE DOWN)</div>
        <div className="traps-row">
          {trapCards?.map((tc) => {
            const isMine = tc.ownerId === mySocketId;
            const isCooldown = tc.placedAtTurn === turnNumber && isMine;

            return (
              <div
                key={tc.id}
                className={`trap-chip ${isMine ? "trap-chip--mine" : ""}`}
                onClick={() => isMine && onSelectTrap(tc)}
              >
                <div className="trap trap-facedown">{isMine ? "🪤" : "?"}</div>
                <span className="trap-owner">{tc.ownerName.slice(0, 4)}</span>
                {isCooldown && <span className="trap-cooldown-dot">⏳</span>}
              </div>
            );
          })}
          <div className="trap trap-add">+</div>
        </div>
      </div>
    </section>
  );
};
