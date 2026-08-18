import React from "react";

interface WinnerModalProps {
  winner: any;
  onRestart: () => void;
  onLobby: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  onRestart,
  onLobby,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-yellow-500/50 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-2">🏆</div>
        <h2 className="text-2xl font-extrabold text-white mb-1">
          Žaidimas baigtas!
        </h2>
        <p className="text-sm text-yellow-400 font-semibold mb-6">
          Laimėtojas: {winner.username || winner.name || "Žaidėjas"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
          >
            Žaisti iš naujo
          </button>
          <button
            onClick={onLobby}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold"
          >
            Į kambarį
          </button>
        </div>
      </div>
    </div>
  );
};
