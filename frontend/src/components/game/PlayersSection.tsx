import React from "react";
import { useGameStore } from "../../store/useGameStore";
import { Avatar } from "./Avatar";

export const PlayersSection: React.FC = () => {
  // Store būsenos – paimame iš store ir užtikriname, kad turime masyvą
  const rawPlayers = useGameStore((s) => s.players);
  const rawOpponents = useGameStore((s) => s.opponents);

  // Jei players tuščias arba undefined, išbandome opponents
  const playersList =
    Array.isArray(rawPlayers) && rawPlayers.length > 0
      ? rawPlayers
      : Array.isArray(rawOpponents)
        ? rawOpponents
        : [];

  const mySocketId = useGameStore((s) => s.mySocketId);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const madMousePlayerId = useGameStore((s) => s.madMousePlayerId);
  const rawMyCards = useGameStore((s) => s.handCards);
  const myCards = Array.isArray(rawMyCards) ? rawMyCards : [];

  // Store veiksmas žaidėjo pasirinkimui
  const setStealTargetPlayer = useGameStore((s) => s.setStealTargetPlayer);

  return (
    <section className="players-section">
      <div className="section-label">PLAYERS IN ORDER</div>
      <div className="players-row">
        {playersList.length === 0 ? (
          <div className="no-players-note">Laukiama žaidėjų...</div>
        ) : (
          playersList.map((p, index) => {
            if (!p) return null;

            const playerId = p.id || (p as any)._id || `player-${index}`;
            const username = p.username || (p as any).name || "Žaidėjas";
            const isMe = playerId === mySocketId;
            const isActive = currentTurnPlayerId === playerId;
            const isMM = madMousePlayerId === playerId;
            const cnt = isMe
              ? myCards.length
              : (p.cardCount ?? (p as any).cardsCount ?? 0);

            return (
              <div
                key={playerId}
                onClick={() => {
                  if (!isMe && setStealTargetPlayer) {
                    setStealTargetPlayer(p);
                  }
                }}
                className={`player-slot ${isActive ? "player-slot--active" : ""} ${
                  isMe ? "player-slot--me" : "cursor-pointer hover:opacity-80"
                }`}
                title={
                  isMe ? "Tai tu" : `Spausk, kad atimtum kortą iš ${username}`
                }
              >
                <Avatar
                  id={playerId}
                  name={username}
                  size={38}
                  active={isActive}
                  isMe={isMe}
                  cardCount={cnt}
                />
                <span className="player-name">{isMe ? "You" : username}</span>
                {isMM && <span className="mm-badge">🐭</span>}
                {p.isConnected === false && (
                  <span className="offline-badge">📵</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default PlayersSection;
