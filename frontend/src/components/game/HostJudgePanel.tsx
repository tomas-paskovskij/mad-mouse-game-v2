import React from "react";
import { useGameStore } from "../../store/useGameStore"; // Pakoreguok kelio nuorodą pagal savo projektą

export const HostJudgePanel: React.FC = () => {
  const isHost = useGameStore((s) => s.isHost);
  const pendingHostCards = useGameStore((s) => s.pendingHostCards) || [];
  const resolveHostAction = useGameStore((s) => s.resolveHostAction);

  console.log("👑 Ar aš Host?", isHost);
  console.log(
    "📋 Laukiančių kortų sąrašas (pendingHostCards):",
    pendingHostCards,
  );

  // Jei vartotojas nėra Host arba nėra laukiančių kortų, nieko nerodome
  if (!isHost || pendingHostCards.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-amber-500/50 rounded-xl p-4 my-4 text-white shadow-2xl max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
        <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
          <span>👑</span> Host Teisėjo Skydelis ({pendingHostCards.length})
        </h3>
        <span className="text-xs text-slate-400">
          Patvirtinkite žaidėjų atliktas užduotis
        </span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {pendingHostCards.map((item) => (
          <div
            key={item.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner"
          >
            {/* Kortos ir žaidėjo informacija */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-1">
                <span>👤 {item.playerName}</span>
                <span>•</span>
                <span>🃏 {item.card.title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.card.description}
              </p>
              {item.card.socialTrigger && (
                <div className="mt-1.5 text-[11px] text-blue-300 bg-slate-900/80 p-2 rounded border border-blue-500/20">
                  🎯 <strong>Užduotis:</strong> {item.card.socialTrigger}
                </div>
              )}
            </div>

            {/* Sprendimo mygtukai */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={() =>
                  resolveHostAction(
                    item.playerId,
                    item.card.id,
                    "success",
                    item.id,
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow active:scale-95"
              >
                🟢 Įvykdyta (+{item.card.blessingPoints || 1} Pt)
              </button>

              <button
                onClick={() =>
                  resolveHostAction(
                    item.playerId,
                    item.card.id,
                    "fail",
                    item.id,
                  )
                }
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow active:scale-95"
              >
                🔴 Neįvykdyta (+{item.card.cursePoints || 1} Pt)
              </button>

              <button
                onClick={() =>
                  resolveHostAction(
                    item.playerId,
                    item.card.id,
                    "skip",
                    item.id,
                  )
                }
                className="bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow active:scale-95"
              >
                ⏭️ Praleisti
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
