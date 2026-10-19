import React from "react";

// Kortos ir žaidėjo tipai (TypeScript)
export interface Card {
  id: string;
  title: string;
  description: string;
  socialTrigger?: string;
  art: string;
  blessingPoints?: number;
  cursePoints?: number;
}

export interface Player {
  id: string;
  name: string;
}

interface HostApprovalModalProps {
  isOpen: boolean;
  activePlayer: Player | null;
  activeCard: Card | null;
  onResolve: (success: boolean) => void;
}

export const HostApprovalModal: React.FC<HostApprovalModalProps> = ({
  isOpen,
  activePlayer,
  activeCard,
  onResolve,
}) => {
  if (!isOpen || !activePlayer || !activeCard) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl text-center">
        {/* Antraštė */}
        <div className="mb-4">
          <span className="bg-amber-300 text-slate-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            👑 Host Teisėjas
          </span>
          <h2 className="text-xl font-bold mt-2">
            {activePlayer.name} vykdo užduotį!
          </h2>
        </div>

        {/* Sužaistos kortos informacija */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 my-4">
          <div className="text-5xl mb-2">{activeCard.art}</div>
          <h3 className="text-lg font-bold text-amber-400">
            {activeCard.title}
          </h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {activeCard.description}
          </p>

          {activeCard.socialTrigger && (
            <div className="mt-3 bg-slate-900/80 p-2.5 rounded-lg text-xs text-blue-300 border border-blue-500/20">
              🎯 <strong>Užduotis:</strong> {activeCard.socialTrigger}
            </div>
          )}
        </div>

        {/* Taškų informacija */}
        <div className="flex justify-around text-xs my-3 font-semibold">
          <span className="text-emerald-400">
            Sėkmė: +{activeCard.blessingPoints || 0} Blessing Pt
          </span>
          <span className="text-rose-400">
            Nesėkmė: +{activeCard.cursePoints || 0} Curse Pt
          </span>
        </div>

        {/* Sprendimo mygtukai */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => onResolve(true)}
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg"
          >
            🟢 ĮVYKDYTA
          </button>
          <button
            onClick={() => onResolve(false)}
            className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg"
          >
            🔴 NEĮVYKDYTA
          </button>
        </div>
      </div>
    </div>
  );
};
