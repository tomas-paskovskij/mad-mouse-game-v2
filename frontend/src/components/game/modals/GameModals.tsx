import React from "react";
import type { CardType, TableCard } from "../../../store/useGameStore";
import type { ChainEntry } from "../../../store/useGameChainStore";
import type { HistoryItem } from "../../../store/useGameHistoryStore";

interface GameModalsProps {
  menuCard: CardType | null;
  setMenuCard: (card: CardType | null) => void;
  stageActive: boolean;
  chain: ChainEntry[];
  stageIdx: number;
  stageDone: () => void;
  trapActivating: TableCard | null;
  setTrapActivating: (trap: TableCard | null) => void;
  showDiscard: boolean;
  setShowDiscard: (show: boolean) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  history: HistoryItem[];
  histRef: React.RefObject<HTMLDivElement | null>;
}

export const GameModals: React.FC<GameModalsProps> = ({
  menuCard,
  setMenuCard,
  showDiscard,
  setShowDiscard,
  showHistory,
  setShowHistory,
  history,
  histRef,
}) => {
  return (
    <>
      {/* Kortelės meniu modalas */}
      {menuCard && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 max-w-xs w-full text-center">
            <h3 className="font-bold text-lg text-white mb-2">
              {menuCard.name}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{menuCard.description}</p>
            <button
              onClick={() => setMenuCard(null)}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold"
            >
              Uždaryti
            </button>
          </div>
        </div>
      )}

      {/* Istorijos modalas */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 max-w-md w-full flex flex-col h-80">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-white">Žaidimo istorija</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 text-xs"
              >
                ✕
              </button>
            </div>
            <div
              ref={histRef}
              className="flex-1 overflow-y-auto space-y-2 pr-2 text-xs"
            >
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-gray-800/50 rounded border border-gray-700/50"
                >
                  <span className="text-gray-500 mr-2">[{item.time}]</span>
                  <span className="text-gray-200">{item.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
