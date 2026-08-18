import React from "react";
import { Avatar } from "./Avatar";

interface Player {
  id: string;
  username: string;
  cardCount: number;
  isConnected?: boolean;
}

interface PlayersSectionProps {
  allOrdered: Player[];
  mySocketId: string | null;
  currentTurnPlayerId: string | null;
  madMousePlayerId: string | null;
  myCardsCount: number;
}

export const PlayersSection: React.FC<PlayersSectionProps> = ({
  allOrdered,
  mySocketId,
  currentTurnPlayerId,
  madMousePlayerId,
  myCardsCount,
}) => {
  return (
    <section className="players-section">
      <div className="section-label">PLAYERS IN ORDER</div>
      <div className="players-row">
        {allOrdered.map((p) => {
          if (!p) return null;
          const isMe = p.id === mySocketId;
          const isActive = currentTurnPlayerId === p.id;
          const isMM = madMousePlayerId === p.id;
          const cnt = isMe ? myCardsCount : p.cardCount;

          return (
            <div
              key={p.id}
              className={`player-slot ${isActive ? "player-slot--active" : ""} ${
                isMe ? "player-slot--me" : ""
              }`}
            >
              <Avatar
                name={p.username}
                size={38}
                active={isActive}
                isMe={isMe}
                cardCount={cnt}
              />
              <span className="player-name">{isMe ? "You" : p.username}</span>
              {isMM && <span className="mm-badge">🐭</span>}
              {!p.isConnected && <span className="offline-badge">📵</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
};
