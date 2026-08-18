import React from "react";
import Card from "./Card";
import type { CardType } from "../../store/useGameStore";

export interface ChainEntry {
  id: number;
  card: CardType;
  playerName: string;
  playerId: string;
  isTrap?: boolean;
}

interface ChainSectionProps {
  chain: ChainEntry[];
  stageActive: boolean;
  stageIdx: number;
}

export const ChainSection: React.FC<ChainSectionProps> = ({
  chain,
  stageActive,
  stageIdx,
}) => {
  return (
    <section className="chain-section">
      <div className="section-label">CHAIN (WILL RESOLVE IN ORDER)</div>
      <div className="chain-row">
        {chain.length === 0 && (
          <span className="chain-empty">Nėra aktyvių kortų</span>
        )}
        {chain.map((e, i) => {
          const isActive = stageActive && stageIdx === i;
          const isDone = i < stageIdx;

          return (
            <React.Fragment key={e.id}>
              <div
                className={`chain-slot ${
                  isActive
                    ? "chain-slot--active"
                    : isDone
                      ? "chain-slot--done"
                      : ""
                }`}
              >
                <span className="chain-num">{i + 1}</span>
                {e.isTrap ? (
                  <div className="chain-facedown">?</div>
                ) : (
                  <Card {...e.card} instanceId={`chain-${e.id}`} compact />
                )}
                <span className="chain-player">{e.playerName.slice(0, 6)}</span>
              </div>
              {i < chain.length - 1 && <span className="chain-arrow">→</span>}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
