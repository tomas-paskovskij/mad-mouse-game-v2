import React from "react";
import Card from "./Card";
import { useGameStore } from "../../store/useGameStore";

export const ChainSection: React.FC = () => {
  // 1. Saugiai tikriname Zustand būsenas per selectorius
  const chain = useGameStore((s: any) => {
    const list =
      s.chain || s.chainEvents || s.pendingCards || s.chainStore?.chain;
    return Array.isArray(list) ? list : [];
  });

  const stageActive = useGameStore(
    (s: any) => s.stageActive ?? s.chainStore?.stageActive ?? false,
  );
  const stageIdx = useGameStore(
    (s: any) => s.stageIdx ?? s.chainStore?.stageIdx ?? 0,
  );

  return (
    <section className="chain-section my-2 w-full">
      <div className="section-label font-bold text-xs text-slate-400 mb-2">
        AKTYVUOTOS KORTOS (CHAIN) {chain.length > 0 && `(${chain.length})`}
      </div>

      <div className="chain-row flex gap-3 items-center flex-wrap min-h-[120px] bg-black/20 p-2.5 rounded-lg">
        {chain.length === 0 ? (
          <span className="chain-empty text-slate-500 text-xs italic">
            Šiuo metu nėra aktyvuotų kortų
          </span>
        ) : (
          chain.map((e: any, i: number) => {
            if (!e) return null;

            const isActive = stageActive && stageIdx === i;
            const isDone = i < stageIdx;
            const playerName =
              e.playerName ||
              e.ownerName ||
              e.ownerUsername ||
              e.player ||
              "Žaidėjas";
            const elementId = e.id || e.instanceId || `chain-item-${i}`;

            // Universalus kortos duomenų ištraukimas
            const cardData =
              e.card ||
              e.cardInstance ||
              e.item ||
              (e.title || e.name ? e : null);

            return (
              <React.Fragment key={elementId}>
                <div
                  className={`chain-slot flex flex-col items-center p-1.5 rounded-lg bg-slate-800 ${
                    isActive
                      ? "ring-2 ring-yellow-500"
                      : isDone
                        ? "opacity-60"
                        : "border border-slate-700"
                  }`}
                >
                  <span className="chain-num text-xs font-bold text-yellow-500 mb-1">
                    #{i + 1}
                  </span>

                  {/* Jei korta yra užversti spąstai */}
                  {e.isTrap && !cardData ? (
                    <div className="chain-facedown w-20 h-28 bg-slate-700 rounded-md flex items-center justify-center text-2xl text-slate-400">
                      ❓
                    </div>
                  ) : cardData ? (
                    /* Saugiai perduodame ir kaip 'card' prop, ir atskirais props, priklausomai nuo Card komponento */
                    <Card
                      card={cardData}
                      {...cardData}
                      instanceId={`chain-${elementId}`}
                      compact
                    />
                  ) : (
                    <div className="w-20 h-28 bg-slate-900 rounded-md p-1 text-[10px] text-white flex items-center justify-center text-center">
                      {e.title || e.name || "Korta"}
                    </div>
                  )}

                  <span className="chain-player text-[10px] text-slate-300 mt-1 max-w-[80px] truncate">
                    {playerName}
                  </span>
                </div>

                {i < chain.length - 1 && (
                  <span className="chain-arrow text-slate-500 font-bold text-sm">
                    ➔
                  </span>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ChainSection;
