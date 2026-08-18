import React from "react";
import { useGameStore } from "../../store/useGameStore";
import "./Opponents.css";

const Opponents: React.FC = () => {
  const { opponents, mySocketId, socket } = useGameStore();
  const myId = mySocketId || socket?.id;

  return (
    <div className="opponents-wrapper">
      {opponents
        .filter((p) => p.id !== myId)
        .map((player) => (
          <div key={player.id} className="opponent-card">
            <div className="opponent-avatar">👤</div>
            <div className="opponent-info">
              <span className="name">{player.username}</span>
              <span className="card-count-text">{player.cardCount} kortos</span>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Opponents;
