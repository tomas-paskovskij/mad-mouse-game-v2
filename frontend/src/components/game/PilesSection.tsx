import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";

export const PilesSection: React.FC = () => {
  // Store būsenos
  const deckCount = useGameStore((s) => s.deckCount);
  const discardPile = useGameStore((s) => s.discardPile) || [];
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const mySocketId = useGameStore((s) => s.mySocketId);
  const actionUsed = useGameStore((s) => s.actionUsed);
  const myCards = useGameStore((s) => s.handCards) || [];
  const handLimit = useGameStore((s) => s.handLimit);

  // Store veiksmai - PATAISYTA: naudojame setShowDiscard vietoj setDiscardOpen
  const drawCard = useGameStore((s) => s.drawCard);
  const endTurn = useGameStore((s) => s.endTurn);
  const setShowDiscard = useGameStore((s) => s.setShowDiscard);

  // Apskaičiuojamos reikšmės
  const isMyTurn = currentTurnPlayerId === mySocketId;
  const vLayers = Math.min(Math.floor((deckCount || 0) / 4), 12);
  const canDraw =
    isMyTurn && !actionUsed && myCards.length < (handLimit || 100000);

  return (
    <div className="main-side-section w-[150px] shrink-0">
      <div className="piles-center">
        <div className="pile-col">
          <div
            className={`deck-stack ${canDraw ? "deck-stack--active" : ""}`}
            style={{ "--layers": vLayers } as any}
            onClick={() => canDraw && drawCard()}
          >
            <span className="deck-num">{deckCount}</span>
          </div>
          <span className="pile-label">DECK</span>
        </div>
        <div className="pile-col">
          <div
            className="discard-pile clickable"
            onClick={() => setShowDiscard(true)}
          >
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
        {/* End Turn Mygtukas */}
        <motion.button
          onClick={endTurn}
          disabled={!isMyTurn}
          whileHover={isMyTurn ? { scale: 1.05 } : {}}
          whileTap={isMyTurn ? { scale: 0.95 } : {}}
          animate={
            isMyTurn
              ? {
                  boxShadow: [
                    "0px 0px 0px rgba(34,197,94,0)",
                    "0px 0px 15px rgba(34,197,94,0.6)",
                    "0px 0px 0px rgba(34,197,94,0)",
                  ],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-full py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-md ${
            isMyTurn
              ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
          }`}
        >
          End turn
        </motion.button>
      </div>
    </div>
  );
};

export default PilesSection;
