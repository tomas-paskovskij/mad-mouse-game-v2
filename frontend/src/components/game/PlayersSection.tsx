import React from "react";
import { useGameStore } from "../../store/useGameStore";
import { Avatar } from "./Avatar";
import { CardSlider } from "../ui/CardSlider";

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
    <section className="players-section w-full min-w-0">
      <div className="section-label font-bold text-xs text-slate-400 mb-2">
        PLAYERS IN ORDER ({playersList.length})
      </div>

      <div className="players-row w-full min-w-0">
        {playersList.length === 0 ? (
          <div className="no-players-note text-slate-500 text-xs italic p-2">
            Laukiama žaidėjų...
          </div>
        ) : (
          <CardSlider
            items={playersList}
            showSeparators={false}
            renderItem={(p: any, index: number) => {
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
                  className={`player-slot flex flex-col items-center p-2 rounded-xl transition-all ${
                    isActive
                      ? "player-slot--active ring-2 ring-amber-400 bg-amber-400/10"
                      : ""
                  } ${
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
                  <span className="player-name text-xs text-slate-200 mt-1 font-semibold">
                    {isMe ? "You" : username}
                  </span>
                  {isMM && <span className="mm-badge text-xs">🐭</span>}
                  {p.isConnected === false && (
                    <span className="offline-badge text-xs">📵</span>
                  )}
                </div>
              );
            }}
          />
        )}
      </div>
    </section>
  );
};

export default PlayersSection;
