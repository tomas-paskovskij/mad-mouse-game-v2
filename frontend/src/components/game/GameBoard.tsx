import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import type { CardType, TableCard } from "../../store/useGameStore";
import { socket } from "../../services/socket";
import Card from "./Card";
import "./GameBoard.css";

const PawnIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 45 45" width={size} height={size} fill="currentColor">
    <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03L15 29H30l-3.41-2.97C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
    <rect x="12" y="30" width="21" height="2.5" rx="1" />
    <rect x="10" y="33.5" width="25" height="3" rx="1" />
  </svg>
);

interface CardMenuProps {
  card: CardType;
  isMyTurn: boolean;
  actionUsed: boolean;
  pendingAction: any;
  turnNumber: number;
  mulliganUsed: boolean;
  onPlay: () => void;
  onDiscard: () => void;
  onInspect: () => void;
  onMulligan: () => void;
  onClose: () => void;
}

const CardActionMenu: React.FC<CardMenuProps> = ({
  card,
  isMyTurn,
  actionUsed,
  pendingAction,
  turnNumber,
  mulliganUsed,
  onPlay,
  onDiscard,
  onInspect,
  onMulligan,
  onClose,
}) => {
  const canPlay =
    (isMyTurn && !actionUsed) ||
    (card.isLightning &&
      card.type === "response" &&
      (card.effect === "shield" || pendingAction !== null));
  const canMulligan = turnNumber === 0 && !mulliganUsed;

  return (
    <motion.div
      className="card-menu-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card-menu"
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-menu-preview">
          <Card {...card} />
        </div>
        <div className="card-menu-actions">
          <button className="cmb cmb--inspect" onClick={onInspect}>
            🔍 Peržiūrėti
          </button>
          {canPlay && (
            <button className="cmb cmb--play" onClick={onPlay}>
              ▶ Panaudoti
            </button>
          )}
          {canMulligan && (
            <button className="cmb cmb--mulligan" onClick={onMulligan}>
              🔀 Mulligan
            </button>
          )}
          {isMyTurn && !actionUsed && (
            <button className="cmb cmb--discard" onClick={onDiscard}>
              🗑 Išmesti
            </button>
          )}
        </div>
        <button className="card-menu-close" onClick={onClose}>
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
};

const GameBoard: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const {
    myCards,
    opponents,
    currentTurnPlayerId,
    deckCount,
    discardPile,
    tableCards,
    pendingAction,
    winner,
    turnNumber,
    handLimit,
    phase,
    notification,
    inspectResult,
    inspectStealResult,
    actionNeedsTarget,
    actionUsed,
    madMousePlayerId,
    mySocketId,
    initGame,
    playCard,
    selectTarget,
    activateTrap,
    inspectStealPick,
    drawCard,
    endTurn,
    declareMadMouse,
    mulligan,
    restartGame,
    clearInspect,
    clearInspectSteal,
    clearActionNeedsTarget,
  } = useGameStore();

  const [menuCard, setMenuCard] = useState<CardType | null>(null);
  const [zoomCard, setZoomCard] = useState<CardType | null>(null);
  const [selectingTarget, setSelectingTarget] = useState<CardType | null>(null);
  const [trapActivating, setTrapActivating] = useState<TableCard | null>(null);
  const [mulliganUsed, setMulliganUsed] = useState(false);

  useEffect(() => {
    if (roomId) initGame(roomId);
  }, [roomId]);

  const myCards_ = myCards || [];
  const opponents_ = opponents || [];
  const tableCards_ = tableCards || [];
  const discardPile_ = discardPile || [];

  const isMyTurn = currentTurnPlayerId === mySocketId;
  const iMadMousePending = madMousePlayerId === mySocketId;
  const canDeclareWin =
    myCards_.length >= (handLimit || 10) && !madMousePlayerId;
  const otherPlayers = opponents_.filter((o) => o.id !== socket.id);
  const myTraps = tableCards_.filter(
    (tc) => tc.ownerId === mySocketId && tc.card.type === "trap",
  );
  const visualLayers = Math.min(Math.floor(deckCount / 4), 12);

  const typeColor: Record<string, string> = {
    action: "#185FA5",
    trap: "#6B21A8",
    response: "#1D4ED8",
    curse: "#991B1B",
  };
  const typeBg: Record<string, string> = {
    action: "#E6F1FB",
    trap: "#F3E8FF",
    response: "#DBEAFE",
    curse: "#FEE2E2",
  };

  function trapsByOwner(id: string) {
    return tableCards_.filter(
      (tc) => tc.ownerId === id && tc.card.type === "trap",
    );
  }

  function handleCardMenuPlay(card: CardType) {
    setMenuCard(null);
    if (card.type === "response" && card.isLightning) {
      playCard(card.instanceId);
      return;
    }
    if (card.type === "trap") {
      playCard(card.instanceId);
      return;
    }
    if (card.requiresTarget) {
      setSelectingTarget(card);
    } else {
      playCard(card.instanceId);
    }
  }

  function handleSelectOpponent(oppId: string) {
    if (trapActivating) {
      activateTrap(trapActivating.id, oppId);
      setTrapActivating(null);
      return;
    }
    if (selectingTarget) {
      playCard(selectingTarget.instanceId, oppId);
      setSelectingTarget(null);
      return;
    }
    if (actionNeedsTarget) {
      selectTarget(oppId);
    }
  }

  function handleActivateTrap(tc: TableCard) {
    if (!isMyTurn || actionUsed) return;
    if (tc.card.requiresTarget) setTrapActivating(tc);
    else activateTrap(tc.id);
  }

  function handleMulligan() {
    setMenuCard(null);
    setMulliganUsed(true);
    mulligan();
  }

  const needsTarget = selectingTarget || actionNeedsTarget || trapActivating;

  // ── WINNER SCREEN ──────────────────────────────────────────────────────────
  if (winner) {
    return (
      <div className="winner-screen">
        <motion.div
          className="winner-box"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            className="winner-emoji"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🐭
          </motion.div>
          <h2>MAD MOUSE!</h2>
          <p className="winner-name">{winner} laimi!</p>
          <div className="winner-actions">
            <button
              className="winner-btn winner-btn--restart"
              onClick={restartGame}
            >
              🔄 Žaisti iš naujo
            </button>
            <button
              className="winner-btn winner-btn--lobby"
              onClick={() => navigate("/lobby")}
            >
              🏠 Lobby
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="game-board">
      {/* PRANEŠIMAI */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`notification notification--${notification.type}`}
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KORTOS MENIU */}
      <AnimatePresence>
        {menuCard && (
          <CardActionMenu
            card={menuCard}
            isMyTurn={isMyTurn}
            actionUsed={actionUsed}
            pendingAction={pendingAction}
            turnNumber={turnNumber}
            mulliganUsed={mulliganUsed}
            onPlay={() => handleCardMenuPlay(menuCard)}
            onDiscard={() => {
              playCard(menuCard.instanceId, undefined, { discard: true });
              setMenuCard(null);
            }}
            onInspect={() => {
              setZoomCard(menuCard);
              setMenuCard(null);
            }}
            onMulligan={handleMulligan}
            onClose={() => setMenuCard(null)}
          />
        )}
      </AnimatePresence>

      {/* ZOOM */}
      <AnimatePresence>
        {zoomCard && (
          <motion.div
            className="card-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomCard(null)}
          >
            <motion.div
              className="zoom-card-wrapper"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <Card {...zoomCard} />
              <button
                className="card-menu-close"
                onClick={() => setZoomCard(null)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAIKINYS */}
      <AnimatePresence>
        {needsTarget && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal">
              <h3>Pasirink taikinį</h3>
              <p className="modal-sub">
                {selectingTarget?.title ||
                  actionNeedsTarget?.card.title ||
                  trapActivating?.card.title}
              </p>
              <div className="target-list">
                {otherPlayers.map((opp) => (
                  <button
                    key={opp.id}
                    className="target-btn"
                    onClick={() => handleSelectOpponent(opp.id)}
                  >
                    <span>{opp.username}</span>
                    <span className="target-count">{opp.cardCount} 🃏</span>
                  </button>
                ))}
              </div>
              <button
                className="btn-cancel"
                onClick={() => {
                  setSelectingTarget(null);
                  setTrapActivating(null);
                  clearActionNeedsTarget();
                }}
              >
                Atšaukti
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INSPEKCIJA */}
      <AnimatePresence>
        {inspectResult && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal modal--wide">
              <h3>🔍 {inspectResult.targetUsername} kortos</h3>
              <div className="cards-scroll">
                {inspectResult.cards.map((c) => (
                  <Card key={c.instanceId} {...c} />
                ))}
              </div>
              <button className="btn-cancel" onClick={clearInspect}>
                Uždaryti
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INSPECT STEAL */}
      <AnimatePresence>
        {inspectStealResult && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal modal--wide">
              <h3>🗡 Pasirink kortą iš {inspectStealResult.targetUsername}</h3>
              <div className="cards-scroll">
                {inspectStealResult.cards.map((c) => (
                  <div
                    key={c.instanceId}
                    onClick={() =>
                      inspectStealPick(
                        inspectStealResult.targetId,
                        c.instanceId,
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <Card {...c} />
                  </div>
                ))}
              </div>
              <button className="btn-cancel" onClick={clearInspectSteal}>
                Atšaukti
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ĖJIMO JUOSTA */}
      <div className={`turn-bar ${isMyTurn ? "turn-bar--mine" : ""}`}>
        {isMyTurn
          ? actionUsed
            ? "✅ Veiksmas atliktas..."
            : "🐭 Tavo ėjimas! Pasirink veiksmą."
          : "Laukiame..."}
      </div>

      {/* POKERIO STALAS */}
      <div className="poker-table-wrap">
        <div className="poker-table">
          {/* CENTRAS */}
          <div className="table-center">
            <div className="pile-wrap">
              <span className="pile-lbl">Išmesta ({discardPile_.length})</span>
              <div className="discard-stack">
                {discardPile_.slice(-4).map((card, i) => (
                  <div
                    key={card.instanceId}
                    className="discard-mini"
                    style={{
                      background: typeBg[card.type] || "#eee",
                      borderColor: typeColor[card.type] || "#999",
                      transform: `rotate(${(i - 1.5) * 7}deg) translateY(${i * -2}px)`,
                      zIndex: i,
                    }}
                  />
                ))}
                {discardPile_.length === 0 && (
                  <span className="pile-empty">–</span>
                )}
              </div>
            </div>

            <div className="pile-wrap">
              <span className="pile-lbl">Kaladė ({deckCount})</span>
              <div
                className={`deck-stack ${isMyTurn && !actionUsed && myCards_.length < (handLimit || 10) ? "deck-stack--active" : ""}`}
                style={{ "--layers": visualLayers } as any}
                onClick={() =>
                  isMyTurn &&
                  !actionUsed &&
                  myCards_.length < (handLimit || 10) &&
                  drawCard()
                }
              >
                {deckCount > 0 ? (
                  <span className="deck-mouse">🐭</span>
                ) : (
                  <span className="pile-empty">–</span>
                )}
              </div>
            </div>
          </div>

          {/* OPONENTAI */}
          {otherPlayers.map((opp, i) => {
            const total = otherPlayers.length;
            const angle = total === 1 ? 270 : 180 + (i / (total - 1)) * 180;
            const rad = angle * (Math.PI / 180);
            const cx = 50 + 42 * Math.cos(rad);
            const cy = 50 + 38 * Math.sin(rad);
            const isActive = currentTurnPlayerId === opp.id;
            const oppTraps = trapsByOwner(opp.id);

            return (
              <div
                key={opp.id}
                className={`player-seat ${isActive ? "player-seat--active" : ""} ${!opp.isConnected ? "player-seat--offline" : ""}`}
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {oppTraps.length > 0 && (
                  <div className="seat-traps">
                    {oppTraps.map((tc, ti) => (
                      <div
                        key={tc.id}
                        className="trap-face-down"
                        style={{ transform: `rotate(${(ti - 1) * 12}deg)` }}
                      />
                    ))}
                  </div>
                )}
                <div
                  className={`player-icon ${isActive ? "player-icon--active" : ""}`}
                >
                  <PawnIcon size={20} />
                </div>
                {/* Mad Mouse mirksintis užrašas */}
                {opp.madMousePending && (
                  <motion.div
                    className="mad-mouse-pending-badge"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    🐭 MAD MOUSE!
                  </motion.div>
                )}
                <div className="seat-name">{opp.username}</div>
                <div className="seat-count">{opp.cardCount}🃏</div>
                {opp.curses?.length > 0 && <div className="seat-curse">💀</div>}
                {!opp.isConnected && <div className="seat-offline">📵</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAD MOUSE PENDING — mano */}
      {iMadMousePending && (
        <motion.div
          className="my-mad-mouse-banner"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
        >
          🐭 MAD MOUSE paskelbtas! Laukiame rato pabaigos...
        </motion.div>
      )}

      {/* MANO TRAP KORTOS */}
      <AnimatePresence>
        {myTraps.length > 0 && (
          <motion.div
            className="my-traps"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="my-traps-lbl">🪤 Mano spąstai</span>
            {myTraps.map((tc) => (
              <div key={tc.id} className="my-trap-chip">
                <div className="trap-face-down trap-face-down--sm" />
                <span className="my-trap-name">{tc.card.title}</span>
                {tc.canActivate && isMyTurn && !actionUsed && (
                  <button
                    className="btn-activate"
                    onClick={() => handleActivateTrap(tc)}
                  >
                    Aktyvuoti
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEŠINĖ PANELĖ */}
      <div className="side-btns">
        {/* Mad Mouse mygtukas */}
        {canDeclareWin && (
          <motion.button
            className="btn-mad-mouse"
            onClick={declareMadMouse}
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            🐭
            <br />
            Mad
            <br />
            Mouse!
          </motion.button>
        )}
      </div>

      {/* RANKA */}
      <div className="hand-area">
        <div className="hand-header">
          <div className="my-seat-info">
            <div
              className={`player-icon player-icon--me ${isMyTurn ? "player-icon--active" : ""}`}
            >
              <PawnIcon size={18} />
            </div>
            <span className="hand-lbl">
              Tu · {myCards_.length}/{handLimit || 10} 🃏
            </span>
            {iMadMousePending && (
              <motion.span
                className="hand-mad-mouse"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                🐭
              </motion.span>
            )}
          </div>
          {/* Action point indikatorius */}
          {isMyTurn && (
            <div
              className={`action-point ${actionUsed ? "action-point--used" : "action-point--available"}`}
            >
              {actionUsed ? "✅ Veiksmas" : "⚡ 1 veiksmas"}
            </div>
          )}
        </div>
        <div className="hand-cards">
          <AnimatePresence>
            {myCards_.map((card, i) => (
              <motion.div
                key={card.instanceId}
                className="hand-card"
                style={{ marginLeft: i === 0 ? 0 : "-40px", zIndex: i }}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                whileHover={{
                  y: -20,
                  zIndex: 100,
                  transition: { duration: 0.1 },
                }}
                onClick={() => !card.hidden && setMenuCard(card)}
              >
                {card.hidden ? (
                  <div className="card-hidden">?</div>
                ) : (
                  <Card {...card} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {myCards_.length === 0 && (
            <p className="hand-empty">Rankoje nėra kortų — trauk iš kaladės!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
