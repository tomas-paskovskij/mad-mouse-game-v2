import React from "react";
import type {
  CardType,
  TableCard,
  HistoryEntry,
} from "../../../store/useGameStore";

interface GameModalsProps {
  menuCard: CardType | null;
  setMenuCard: (card: CardType | null) => void;
  trapActivating: TableCard | null;
  setTrapActivating: (trap: TableCard | null) => void;
  showDiscard: boolean;
  setShowDiscard: (show: boolean) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  history: HistoryEntry[];
  histRef: React.RefObject<HTMLDivElement | null>;
  discardPile?: CardType[];
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
  discardPile = [],
}) => {
  return (
    <>
      {/* Kortelės meniu modalas */}
      {menuCard && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 max-w-xs w-full text-center shadow-2xl">
            <h3 className="font-bold text-lg text-white mb-2">
              {menuCard.title}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{menuCard.description}</p>
            <button
              onClick={() => setMenuCard(null)}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Uždaryti
            </button>
          </div>
        </div>
      )}

      {/* Istorijos modalas */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 max-w-md w-full flex flex-col h-80 shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                📜 Žaidimo istorija
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
            <div
              ref={histRef}
              className="flex-1 overflow-y-auto space-y-2 pr-2 text-xs"
            >
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Istorija tuščia...
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-gray-800/50 rounded border border-gray-700/50 flex items-start gap-2"
                  >
                    <span className="text-gray-500 shrink-0">
                      [{item.time}]
                    </span>
                    <span className="text-gray-200 break-words">
                      {item.msg}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Išmestų kortų (Discard Pile) modalas */}
      {showDiscard && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 max-w-lg w-full flex flex-col h-96 shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <h3 className="font-bold text-sm text-white">
                🗑️ Išmestos kortos ({discardPile.length})
              </h3>
              <button
                onClick={() => setShowDiscard(false)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
              {discardPile.length === 0 ? (
                <p className="text-gray-500 text-center col-span-full py-12 text-xs">
                  Išmestų kortų kauburėlis tuščias.
                </p>
              ) : (
                discardPile.map((card, idx) => (
                  <div
                    key={card.instanceId || idx}
                    className="p-2 bg-gray-800 rounded border border-gray-700 text-xs flex flex-col justify-between"
                  >
                    <span className="font-semibold text-gray-200">
                      {card.title}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                      {card.description}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
