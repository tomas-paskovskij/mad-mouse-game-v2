import React from "react";
import { useGameStore, TableCard } from "../../store/useGameStore";

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
    <section className="middle-section">
      <div className="traps-area">
        <div className="section-label">MANO SPĄSTAI (FACE DOWN)</div>
        <div
          className="traps-row"
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          {myTraps.map((tc) => {
            const isCooldown = tc.placedAtTurn === turnNumber;
            const displayName = tc.ownerName ? tc.ownerName.slice(0, 4) : "Aš";

            return (
              <div
                key={tc.id}
                className="trap-chip trap-chip--mine"
                onClick={() => setTrapActivating(tc)}
                style={{ cursor: "pointer" }}
              >
                <div className="trap trap-facedown">🪤</div>
                <span className="trap-owner">{displayName}</span>
                {isCooldown && <span className="trap-cooldown-dot">⏳</span>}
              </div>
            );
          })}

          {myTraps.length === 0 && (
            <div className="text-slate-500 text-xs italic">
              Jūs neturite padėtų spąstų
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrapsSection;
