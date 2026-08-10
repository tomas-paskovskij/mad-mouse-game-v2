import React from "react";

interface CenterPilesProps {
  deckCount: number;
  discardCard: string;
  discardCount: number;
  position: "left" | "right";
}

const CenterPiles: React.FC<CenterPilesProps> = ({
  deckCount,
  discardCount,
  position,
}) => {
  if (position === "left") {
    return (
      <div className="pile-group">
        <span className="pile-label">DECK</span>
        <div className="card-pile deck-pile">
          <span className="pile-count">{deckCount}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pile-group">
      <span className="pile-label">DISCARD</span>
      <div className="card-pile discard-pile">
        <div className="mini-card-inner">🔄</div>
        <span className="pile-count-bottom">{discardCount}</span>
      </div>
    </div>
  );
};

export default CenterPiles;
