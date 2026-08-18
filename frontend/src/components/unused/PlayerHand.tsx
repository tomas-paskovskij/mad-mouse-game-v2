import React from "react";
import { useGameStore } from "../../store/useGameStore";
import Card from "./Card";
import "./PlayerHand.css";

const PlayerHand: React.FC = () => {
  const { myCards, playCard, currentTurnPlayerId, mySocketId, socket } =
    useGameStore();
  const myId = mySocketId || socket?.id;
  const isMyTurn = currentTurnPlayerId === myId;

  return (
    <div className="player-hand-container">
      <div className="player-hand">
        {myCards.map((card, i) => (
          <div
            key={card.instanceId}
            className="card-wrapper"
            style={{ marginLeft: i === 0 ? 0 : "-35px", zIndex: i }}
            onClick={() => isMyTurn && playCard(card.instanceId)}
          >
            <Card {...card} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;
