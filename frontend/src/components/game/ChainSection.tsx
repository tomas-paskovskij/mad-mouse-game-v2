import React from "react";
import Card from "./Card";
import { useGameStore } from "../../store/useGameStore";
import { CardSlider } from "../ui/CardSlider";

export const ChainSection: React.FC = () => {
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

  // Saugiai paimame bet kurią prieinamą peržiūros/priartinimo funkciją iš store
  const openZoomModal = useGameStore((s: any) => {
    return (
      s.setZoomedCard ||
      s.setTrapZoom ||
      s.setSelectedCard ||
      s.setInspectCard ||
      ((card: any) =>
        console.log("Nėra peržiūros funkcijos store, korta:", card))
    );
  });

  const handleInspectCard = (e: any, cardData: any) => {
    // Apjungiame kortelės objektą, kad peržiūros modalas gautų visus laukus (title, description ir t.t.)
    const rawCard = cardData || e;
    const fullCardToInspect = {
      ...e,
      ...rawCard,
      ...(rawCard.card || {}),
      isFlipped: true,
      hidden: false,
      readOnly: true, // Kad nerodytų veiksmo mygtukų "Žaisti/Išmesti"
    };

    openZoomModal(fullCardToInspect);
  };

  return (
    <section className="chain-section my-2 w-full min-w-0">
      <div className="section-label font-bold text-xs text-slate-400 mb-2">
        AKTYVUOTOS KORTOS (CHAIN) {chain.length > 0 && `(${chain.length})`}
      </div>

      <div className="chain-row w-full min-w-0 min-h-[120px] bg-black/20 p-2.5 rounded-lg overflow-hidden">
        {chain.length === 0 ? (
          <span className="chain-empty text-slate-500 text-xs italic">
            Šiuo metu nėra aktyvuotų kortų
          </span>
        ) : (
          <CardSlider
            items={chain}
            showSeparators={true}
            renderItem={(e: any, i: number) => {
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

              const cardData =
                e.card ||
                e.cardInstance ||
                e.item ||
                (e.title || e.name ? e : null);

              const isUnknownTrap = Boolean(e.isTrap && !cardData);

              return (
                <div
                  key={elementId}
                  onClick={() => {
                    if (!isUnknownTrap) {
                      handleInspectCard(e, cardData);
                    }
                  }}
                  className={`chain-slot flex flex-col items-center p-1.5 rounded-lg bg-slate-800 transition-transform active:scale-95 ${
                    isUnknownTrap
                      ? "cursor-not-allowed"
                      : "cursor-pointer hover:bg-slate-700/80 hover:scale-105"
                  } ${
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

                  {isUnknownTrap ? (
                    <div className="chain-facedown w-20 h-28 bg-slate-700 rounded-md flex items-center justify-center text-2xl text-slate-400">
                      ❓
                    </div>
                  ) : cardData ? (
                    /* pointer-events-none užtikrina, kad klikas prasiskverbs iki div konteinerio */
                    <div className="pointer-events-none">
                      <Card
                        card={cardData}
                        {...cardData}
                        instanceId={`chain-${elementId}`}
                        compact
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-28 bg-slate-900 rounded-md p-1 text-[10px] text-white flex items-center justify-center text-center">
                      {e.title || e.name || "Korta"}
                    </div>
                  )}

                  <span className="chain-player text-[10px] text-slate-300 mt-1 max-w-[80px] truncate">
                    {playerName}
                  </span>
                </div>
              );
            }}
          />
        )}
      </div>
    </section>
  );
};

export default ChainSection;
