import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../Card";
import { useGameStore } from "../../../store/useGameStore";

export const PlayerStealModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"hand" | "table">("hand");

  // Imame tikslinį žaidėją ir visus priešininkus iš store
  const targetPlayerStatic = useGameStore((s) => s.stealTargetPlayer);
  const opponents = useGameStore((s) => s.opponents) || [];
  const tableCards = useGameStore((s) => s.tableCards) || [];

  // Store veiksmai
  const setStealTargetPlayer = useGameStore((s) => s.setStealTargetPlayer);
  const stealCardFromPlayer = useGameStore((s) => s.stealCardFromPlayer);

  // 1 SPRENDIMAS: Dinamiškai surandame žaidėją iš gyvo `opponents` sąrašo.
  // Jei priešininkas patrauks kortą, `opponents` atsinaujins ir modalas iškart parodys naują kortą!
  const targetPlayer =
    opponents.find((p) => p.id === targetPlayerStatic?.id) ||
    targetPlayerStatic;

  const handleClose = () => {
    setStealTargetPlayer(null);
  };

  const handleStealCard = (item: any, source: "hand" | "table") => {
    if (!targetPlayer) return;

    // Surandame instanceId
    const cardInstanceId =
      source === "table"
        ? item.card?.instanceId || item.instanceId
        : item.instanceId;

    stealCardFromPlayer(targetPlayer.id, cardInstanceId, source);
  };

  // Paimame žaidėjo rankos kortas
  const playerHand = targetPlayer
    ? Array.isArray(targetPlayer.cards)
      ? targetPlayer.cards
      : Array.isArray(targetPlayer.hand)
        ? targetPlayer.hand
        : []
    : [];

  // Stalo kortos surandamos pagal žaidėjo ID
  const playerTable = targetPlayer
    ? tableCards.filter((tc) => tc.ownerId === targetPlayer.id)
    : [];

  const rawCards = activeTab === "hand" ? playerHand : playerTable;
  const currentCards = rawCards.filter(Boolean);

  return (
    <AnimatePresence>
      {targetPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative flex flex-col gap-4"
          >
            {/* Uždarymo mygtukas */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold transition-colors"
            >
              ✕
            </button>

            {/* Antraštė */}
            <div>
              <h3 className="text-xl font-bold text-white">
                Atimti kortą iš:{" "}
                <span className="text-indigo-400">
                  {targetPlayer.username || targetPlayer.name || "Žaidėjo"}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Pasirinkite užverstą kortą, kurią norite perimti į savo ranką.
              </p>
            </div>

            {/* Kortelių perjungimas */}
            <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab("hand")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "hand"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Rankoje ({playerHand.length})
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "table"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Ant stalo ({playerTable.length})
              </button>
            </div>

            {/* Kortų sąrašas */}
            <div className="min-h-[200px] max-h-[350px] overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-950/50 flex flex-wrap gap-3 justify-center items-center">
              {currentCards.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  Šioje vietoje kortų nėra.
                </p>
              ) : (
                currentCards.map((item: any, idx) => {
                  const cardObj = item.card ? item.card : item;

                  return (
                    <motion.div
                      key={cardObj.instanceId || item.id || idx}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStealCard(item, activeTab)}
                      className="cursor-pointer relative group"
                    >
                      {/* 2 SPRENDIMAS: Tiek rankos, tiek stalo kortos modale rodomos užverstos metant ? */}
                      <div className="w-24 h-36 bg-indigo-950 border-2 border-indigo-500/50 rounded-lg flex flex-col items-center justify-center gap-2 group-hover:border-indigo-400 transition-colors shadow-lg">
                        <span className="text-2xl font-bold text-indigo-300">
                          ?
                        </span>
                        <span className="text-[10px] text-indigo-400 uppercase font-semibold text-center px-1">
                          {activeTab === "hand"
                            ? `Korta #${idx + 1}`
                            : `Stalo #${idx + 1}`}
                        </span>
                      </div>

                      {/* Užvedimo (Hover) efektas */}
                      <div className="absolute inset-0 bg-indigo-600/80 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-xs font-bold uppercase tracking-wider bg-slate-900 px-2 py-1 rounded shadow">
                          Atimti
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PlayerStealModal;
