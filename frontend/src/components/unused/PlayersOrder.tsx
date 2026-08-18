import React from "react";

interface Player {
  id: number;
  name: string;
  count: number;
  isCurrent?: boolean;
}

interface PlayersOrderProps {
  players: Player[];
}

const PlayersOrder: React.FC<PlayersOrderProps> = ({ players }) => (
  <section className="players-order-section">
    <h4 className="section-title">PLAYERS IN ORDER</h4>
    <div className="players-list">
      {players.map((player) => (
        <div
          key={player.id}
          className={`player-avatar-item ${player.isCurrent ? "active" : ""}`}
        >
          <div className="avatar-circle">
            👤
            <span className="card-badge">{player.count}</span>
          </div>
          <span className="player-name">{player.name}</span>
        </div>
      ))}
    </div>
  </section>
);

export default PlayersOrder;
