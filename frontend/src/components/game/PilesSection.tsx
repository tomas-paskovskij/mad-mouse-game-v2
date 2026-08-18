import React from "react";

interface PilesSectionProps {
  deckCount: number;
  discardPile: any[];
  isMyTurn: boolean;
  actionUsed: boolean;
  myCardsCount: number;
  handLimit: number;
  onDrawCard: () => void;
  onEndTurn: () => void;
  onOpenDiscard: () => void;
}

export const PilesSection: React.FC<PilesSectionProps> = ({
  deckCount,
  discardPile,
  isMyTurn,
  actionUsed,
  myCardsCount,
  handLimit,
  onDrawCard,
  onEndTurn,
  onOpenDiscard,
}) => {
  const vLayers = Math.min(Math.floor(deckCount / 4), 12);
  const canDraw =
    isMyTurn && !actionUsed && myCardsCount < (handLimit || 100000);

  return (
    <div className="main-side-section w-[150px] shrink-0">
      <div className="piles-center">
        <div className="pile-col">
          <div
            className={`deck-stack ${canDraw ? "deck-stack--active" : ""}`}
            style={{ "--layers": vLayers } as any}
            onClick={() => canDraw && onDrawCard()}
          >
            <span className="deck-num">{deckCount}</span>
          </div>
          <span className="pile-label">DECK</span>
        </div>
        <div className="pile-col">
          <div className="discard-pile clickable" onClick={onOpenDiscard}>
            {discardPile.slice(-3).map((c, i) => (
              <div
                key={`${c.instanceId}-${i}`}
                className="discard-mini"
                style={{
                  transform: `rotate(${(i - 1) * 9}deg) translateY(${i * -2}px)`,
                  zIndex: i,
                }}
              />
            ))}
            {discardPile.length > 0 && (
              <span className="discard-count-badge">{discardPile.length}</span>
            )}
            {discardPile.length === 0 && (
              <span className="pile-empty-lbl">–</span>
            )}
          </div>
          <span className="pile-label">DISCARD</span>
        </div>
      </div>
      <div>
        <button className="end-turn-btn" onClick={onEndTurn}>
          End turn
        </button>
      </div>
    </div>
  );
};
