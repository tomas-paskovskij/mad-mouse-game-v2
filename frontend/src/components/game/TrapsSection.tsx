import React from "react";
import { useGameStore } from "../../store/useGameStore";
import { CardSlider } from "../ui/CardSlider";

export const TrapsSection: React.FC = () => {
  // Store būsenos
  const trapCards = useGameStore((s) => s.tableCards) || [];
  const mySocketId = useGameStore((s) => s.mySocketId);
  const turnNumber = useGameStore((s) => s.turnNumber);

  // Store veiksmas spąstų pasirinkimui
  const setTrapActivating = useGameStore((s) => s.setTrapActivating);

  // Filtruojame TIK dabartinio žaidėjo padėtus spąstus
  // Jei mySocketId dar nėra užkrautas, negrąžiname nieko
  const myTraps = mySocketId
    ? trapCards.filter((tc) => tc.ownerId === mySocketId)
    : [];

  return (
    <section className="middle-section w-full min-w-0">
      <div className="traps-area w-full min-w-0">
        <div className="section-label font-bold text-xs text-slate-400 mb-2">
          MANO SPĄSTAI (FACE DOWN) ({myTraps.length})
        </div>

        {myTraps.length === 0 ? (
          <div className="text-slate-500 text-xs italic p-2">
            Jūs neturite padėtų spąstų
          </div>
        ) : (
          <div className="traps-row w-full min-w-0">
            <CardSlider
              items={myTraps}
              showSeparators={false}
              renderItem={(tc: any) => {
                const isCooldown = tc.placedAtTurn === turnNumber;
                const displayName = tc.ownerName
                  ? tc.ownerName.slice(0, 4)
                  : "Aš";

                return (
                  <div
                    key={tc.id}
                    className="trap-chip trap-chip--mine flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 my-1"
                    onClick={() => setTrapActivating(tc)}
                  >
                    <div className="trap trap-facedown relative w-16 h-22 bg-indigo-950 border border-indigo-500/40 rounded-lg flex items-center justify-center text-2xl shadow-md">
                      🪤
                      {isCooldown && (
                        <span
                          className="trap-cooldown-dot absolute -top-1 -right-1 text-xs"
                          title="Laukia kito ėjimo"
                        >
                          ⏳
                        </span>
                      )}
                    </div>
                    <span className="trap-owner text-[10px] text-slate-400 mt-1 font-semibold">
                      {displayName}
                    </span>
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default TrapsSection;
