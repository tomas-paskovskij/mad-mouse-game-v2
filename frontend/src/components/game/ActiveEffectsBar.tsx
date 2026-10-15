import React from "react";
import { useGameStore } from "../../store/useGameStore";

export const ActiveEffectsBar: React.FC = () => {
  const allCurses = useGameStore((state) => state.allCurses) || [];

  // Paskaičiuojame, ar išvis yra kokių nors aktyvių prakeikimų tarp visų žaidėjų
  const totalCursesCount = allCurses.reduce(
    (acc, playerGroup) => acc + (playerGroup.curses?.length || 0),
    0,
  );

  // Jei nori, kad skydelis rodytųsi tik tada, kai yra prakeikimų:
  if (totalCursesCount === 0) return null;

  return (
    <div className="w-full px-3 py-2 bg-slate-900/90 backdrop-blur-md border-t border-b border-slate-700/60 my-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
          Aktyvūs prakeikimai žaidime ({totalCursesCount})
        </span>
      </div>

      {/* Slideris arba sąrašas per visus žaidėjus */}
      <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none poker-slider-container">
        {allCurses.map((playerGroup) => {
          if (!playerGroup.curses || playerGroup.curses.length === 0)
            return null;

          return playerGroup.curses.map((curse) => {
            const progressPercent = Math.max(
              0,
              ((curse.turnsLeft ?? 2) / (curse.maxTurns || 2)) * 100,
            );

            return (
              <div
                key={curse.id || `${playerGroup.playerId}-${curse.title}`}
                className="relative flex-shrink-0 w-52 p-2.5 rounded-xl border border-purple-500/40 bg-purple-950/40 text-purple-100 flex flex-col justify-between shadow-lg"
              >
                {/* Viršutinė dalis su žaidėjo vardo etikete */}
                <div className="flex items-center justify-between mb-1 border-b border-purple-800/50 pb-1">
                  <span className="text-[10px] font-semibold text-amber-300 truncate">
                    👤 {playerGroup.username}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/80 uppercase tracking-wide text-purple-200">
                    Prakeikimas
                  </span>
                </div>

                <div className="flex items-center gap-2 my-1">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 border border-slate-600 text-sm flex-shrink-0">
                    {curse.icon || "🤐"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{curse.title}</p>
                  </div>
                </div>

                <p className="text-[11px] my-1 line-clamp-2 opacity-90 leading-snug">
                  {curse.description}
                </p>

                <div>
                  <div className="flex justify-between items-center text-[10px] opacity-80 mb-1">
                    <span>Liko laiko:</span>
                    <span className="font-bold text-amber-300">
                      {curse.turnsLeft ?? 2} ėjim.
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
