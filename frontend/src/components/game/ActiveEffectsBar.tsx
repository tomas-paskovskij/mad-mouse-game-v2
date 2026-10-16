import React from "react";
import { useGameStore } from "../../store/useGameStore";

export const ActiveEffectsBar: React.FC = () => {
  const allCurses = useGameStore((state) => state.allCurses) || [];

  // Paskaičiuojame, ar išvis yra kokių nors aktyvių efektų tarp visų žaidėjų
  const totalCursesCount = allCurses.reduce(
    (acc, playerGroup) => acc + (playerGroup.curses?.length || 0),
    0,
  );

  // Jei nėra aktyvių efektų, nerodome skydelio
  if (totalCursesCount === 0) return null;

  return (
    <div className="w-full px-3 py-2 bg-slate-900/90 backdrop-blur-md border-t border-b border-slate-700/60 my-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
          Aktyvūs efektai žaidime ({totalCursesCount})
        </span>
      </div>

      {/* Slideris arba sąrašas per visus žaidėjus */}
      <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none poker-slider-container">
        {allCurses.map((playerGroup) => {
          if (!playerGroup.curses || playerGroup.curses.length === 0)
            return null;

          return playerGroup.curses.map((curse) => {
            // 🎯 Sutvarkytas progressPercent skaičiavimas (su fallbackais)
            const current = curse.turnsLeft ?? curse.remainingTurns ?? 1;
            const max = curse.maxTurns ?? curse.duration ?? 1;
            const progressPercent = Math.min(
              100,
              Math.max(0, (current / max) * 100),
            );

            const isBlessing = curse.type === "blessing";
            const isRounds = curse.durationType === "rounds";
            const durationLabel = isRounds ? "rat." : "ėjim.";

            return (
              <div
                key={curse.id || `${playerGroup.playerId}-${curse.title}`}
                className={`relative flex-shrink-0 w-64 p-2.5 rounded-xl border flex flex-col justify-between shadow-lg ${
                  isBlessing
                    ? "border-amber-400/70 bg-gradient-to-br from-amber-950/70 via-yellow-950/50 to-slate-900/95 text-amber-100 shadow-amber-500/20"
                    : "border-purple-500/40 bg-purple-950/40 text-purple-100"
                }`}
              >
                {/* Viršutinė dalis su žaidėjo vardo etikete ir tipu */}
                <div
                  className={`flex items-center justify-between mb-1 border-b pb-1 ${
                    isBlessing ? "border-amber-700/50" : "border-purple-800/50"
                  }`}
                >
                  <span
                    className={`text-[10px] font-semibold truncate ${
                      isBlessing ? "text-amber-300" : "text-purple-300"
                    }`}
                  >
                    👤 {playerGroup.username}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide ${
                      isBlessing
                        ? "bg-amber-900/90 text-amber-200 border border-amber-600/50"
                        : "bg-purple-900/80 text-purple-200"
                    }`}
                  >
                    {isBlessing ? "Palaiminimas" : "Prakeikimas"}
                  </span>
                </div>

                <div className="flex items-center gap-2 my-1">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full border text-sm flex-shrink-0 ${
                      isBlessing
                        ? "bg-amber-900/60 border-amber-500/60 text-amber-200"
                        : "bg-slate-800 border-slate-600"
                    }`}
                  >
                    {curse.icon || (isBlessing ? "✨" : "🤐")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold break-words">
                      {curse.title}
                    </p>
                  </div>
                </div>

                {/* Aprašymas be apkirpimų */}
                <p className="text-[11px] my-1 break-words opacity-90 leading-snug">
                  {curse.description}
                </p>

                <div>
                  <div className="flex justify-between items-center text-[10px] opacity-80 mb-1">
                    <span>Liko laiko:</span>
                    <span
                      className={`font-bold ${
                        isBlessing ? "text-amber-300" : "text-purple-300"
                      }`}
                    >
                      {current} {durationLabel}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isBlessing ? "bg-amber-400" : "bg-purple-400"
                      }`}
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
