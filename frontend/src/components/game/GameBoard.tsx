import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
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

// ─── CARD ACTION MENU ─────────────────────────────────────────────────────────
const CardActionMenu: React.FC<{
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
}> = ({
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
          {turnNumber === 0 && !mulliganUsed && (
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

// ─── TRAP MENU ────────────────────────────────────────────────────────────────
const TrapMenu: React.FC<{
  tc: TableCard;
  isMyTurn: boolean;
  actionUsed: boolean;
  turnNumber: number;
  onInspect: () => void;
  onActivate: () => void;
  onClose: () => void;
}> = ({
  tc,
  isMyTurn,
  actionUsed,
  turnNumber,
  onInspect,
  onActivate,
  onClose,
}) => {
  const canActivate =
    tc.canActivate && isMyTurn && !actionUsed && tc.placedAtTurn !== turnNumber;
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
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.85 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="trap-menu-title">🪤 Mano spąstas</div>
        <div className="trap-menu-name">{tc.card.title}</div>
        <div className="card-menu-actions">
          <button className="cmb cmb--inspect" onClick={onInspect}>
            🔍 Peržiūrėti efektą
          </button>
          {canActivate && (
            <button className="cmb cmb--play" onClick={onActivate}>
              ⚡ Aktyvuoti
            </button>
          )}
          {tc.placedAtTurn === turnNumber && (
            <p className="trap-cooldown">⏳ Galima aktyvuoti kitą ėjimą</p>
          )}
        </div>
        <button className="card-menu-close" onClick={onClose}>
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── DISCARD MODAL ────────────────────────────────────────────────────────────
const DiscardModal: React.FC<{ discardPile: any[]; onClose: () => void }> = ({
  discardPile,
  onClose,
}) => {
  const typeColor: Record<string, string> = {
    action: "#60a5fa",
    trap: "#a78bfa",
    response: "#34d399",
    curse: "#f87171",
  };
  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal modal--wide"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>🗑 Išmestos kortos ({discardPile.length})</h3>
        <div className="discard-modal-list">
          {discardPile.length === 0 && <p className="empty-msg">Nėra</p>}
          {[...discardPile].reverse().map((card, i) => (
            <div
              key={`${card.instanceId}-${i}`}
              className="discard-row"
              style={{ borderColor: typeColor[card.type] || "#555" }}
            >
              <span className="discard-num">#{discardPile.length - i}</span>
              <span className="discard-title">{card.title}</span>
              <span className="discard-owner">
                👤 {card.ownerUsername || "?"}
              </span>
              <span
                className="discard-type"
                style={{ color: typeColor[card.type] }}
              >
                {card.type}
              </span>
            </div>
          ))}
        </div>
        <button className="btn-cancel" onClick={onClose}>
          Uždaryti
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
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
    notification,
    inspectResult,
    inspectStealResult,
    actionNeedsTarget,
    actionUsed,
    madMousePlayerId,
    reactionWindow,
    playedCard,
    turnChain,
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
    passReaction,
    activateTrapReaction,
    clearInspect,
    clearInspectSteal,
    clearActionNeedsTarget,
    clearPlayedCard,
  } = useGameStore();

  const [menuCard, setMenuCard] = useState<CardType | null>(null);
  const [zoomCard, setZoomCard] = useState<CardType | null>(null);
  const [selectingTarget, setSelectingTarget] = useState<CardType | null>(null);
  const [trapActivating, setTrapActivating] = useState<TableCard | null>(null);
  const [mulliganUsed, setMulliganUsed] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [trapMenuTc, setTrapMenuTc] = useState<TableCard | null>(null);
  const [trapZoom, setTrapZoom] = useState<TableCard | null>(null);
  const [history, setHistory] = useState<
    { id: number; msg: string; type: string; time: string }[]
  >([]);
  const [showHistory, setShowHistory] = useState(false);
  const [flashEmoji, setFlashEmoji] = useState<string | null>(null);
  const [reactionSecs, setReactionSecs] = useState(0);
  const historyRef = useRef<HTMLDivElement>(null);
  const reactionInterval = useRef<any>(null);

  useEffect(() => {
    if (roomId) initGame(roomId);
  }, [roomId]);

  // Historia
  useEffect(() => {
    if (!notification) return;
    const time = new Date().toLocaleTimeString("lt-LT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setHistory((prev) => [
      ...prev.slice(-49),
      {
        id: Date.now(),
        msg: notification.message,
        type: notification.type,
        time,
      },
    ]);
    const emojis: Record<string, string> = {
      action: "⚡",
      trap: "🪤",
      response: "🛡",
      curse: "💀",
      turn: "▶",
      skip: "⏭",
      mad_mouse: "🐭",
      shield: "🛡",
    };
    setFlashEmoji(emojis[notification.type] || "⚡");
    setTimeout(() => setFlashEmoji(null), 900);
  }, [notification]);

  useEffect(() => {
    if (historyRef.current)
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [history]);

  // Reaction timer
  useEffect(() => {
    if (reactionWindow) {
      setReactionSecs(Math.round(reactionWindow.durationMs / 1000));
      reactionInterval.current = setInterval(() => {
        setReactionSecs((s) => {
          if (s <= 1) {
            clearInterval(reactionInterval.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(reactionInterval.current);
      setReactionSecs(0);
    }
    return () => clearInterval(reactionInterval.current);
  }, [reactionWindow?.startedAt]);

  const myCards_ = myCards || [];
  const opponents_ = opponents || [];
  const tableCards_ = tableCards || [];
  const discardPile_ = discardPile || [];

  const isMyTurn = currentTurnPlayerId === mySocketId;
  const iMadMousePending = madMousePlayerId === mySocketId;
  const canDeclareWin =
    myCards_.length >= (handLimit || 10) && !madMousePlayerId;
  const visualLayers = Math.min(Math.floor(deckCount / 4), 12);
  const otherPlayers = opponents_.filter((o) => o.id !== socket.id);
  const myTraps = tableCards_.filter(
    (tc) => tc.ownerId === mySocketId && tc.card.type === "trap",
  );

  const typeColor: Record<string, string> = {
    action: "#60a5fa",
    trap: "#a78bfa",
    response: "#34d399",
    curse: "#f87171",
  };

  function trapsByOwner(id: string | null) {
    return tableCards_.filter(
      (tc) => tc.ownerId === id && tc.card.type === "trap",
    );
  }

  // Žaidėjų pozicijos
  const myPos = { x: 50, y: 110 };
  function getOtherPos(i: number, total: number) {
    if (total === 0) return { x: 50, y: 88 };
    const start = 200,
      end = 340;
    const angle = total === 1 ? 270 : start + (i / (total - 1)) * (end - start);
    const rad = (angle * Math.PI) / 180;
    return { x: 50 + 46 * Math.cos(rad), y: 50 + 44 * Math.sin(rad) };
  }

  function handleCardMenuPlay(card: CardType) {
    setMenuCard(null);
    if (card.isLightning && card.type === "response") {
      playCard(card.instanceId);
      return;
    }
    if (card.type === "trap") {
      playCard(card.instanceId);
      return;
    }
    if (card.requiresTarget) setSelectingTarget(card);
    else playCard(card.instanceId);
  }

  function handleSelectOpponent(oppId: string) {
    if (trapActivating) {
      if (reactionWindow) activateTrapReaction(trapActivating.id, oppId);
      else activateTrap(trapActivating.id, oppId);
      setTrapActivating(null);
      return;
    }
    if (selectingTarget) {
      playCard(selectingTarget.instanceId, oppId);
      setSelectingTarget(null);
      return;
    }
    if (actionNeedsTarget) selectTarget(oppId);
  }

  const needsTarget = selectingTarget || actionNeedsTarget || trapActivating;

  // ── WINNER ────────────────────────────────────────────────────────────────
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
              🔄 Iš naujo
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
    // 4 punktas — background keičiasi kai tavo ėjimas
    <div className={`game-board ${isMyTurn ? "game-board--my-turn" : ""}`}>
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

      {/* PADĖTA KORTA — rodoma ekrano viduryje */}
      <AnimatePresence>
        {playedCard && (
          <motion.div
            className="played-card-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={clearPlayedCard}
          >
            <motion.div
              className="played-card-container"
              initial={{ scale: 0.3, y: -80, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{
                scale: 0.5,
                y: 60,
                opacity: 0,
                transition: { duration: 0.4 },
              }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
            >
              <div className="played-card-player">
                <PawnIcon size={14} />
                <span>{playedCard.playerName}</span>
              </div>
              <Card
                {...playedCard.card}
                instanceId={`played-${playedCard.card.id}`}
              />
            </motion.div>
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
            onMulligan={() => {
              setMenuCard(null);
              setMulliganUsed(true);
              mulligan();
            }}
            onClose={() => setMenuCard(null)}
          />
        )}
      </AnimatePresence>

      {/* TRAP MENIU */}
      <AnimatePresence>
        {trapMenuTc && (
          <TrapMenu
            tc={trapMenuTc}
            isMyTurn={isMyTurn}
            actionUsed={actionUsed}
            turnNumber={turnNumber}
            onInspect={() => {
              setTrapZoom(trapMenuTc);
              setTrapMenuTc(null);
            }}
            onActivate={() => {
              const tc = trapMenuTc;
              setTrapMenuTc(null);
              if (tc.card.requiresTarget) setTrapActivating(tc);
              else activateTrap(tc.id);
            }}
            onClose={() => setTrapMenuTc(null)}
          />
        )}
      </AnimatePresence>

      {/* ZOOM */}
      <AnimatePresence>
        {(zoomCard || trapZoom) && (
          <motion.div
            className="card-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setZoomCard(null);
              setTrapZoom(null);
            }}
          >
            <motion.div
              className="zoom-card-wrapper"
              initial={{ scale: 0.5 }}
              animate={{ scale: 2 }}
              exit={{ scale: 0.5 }}
            >
              {zoomCard && <Card {...zoomCard} />}
              {trapZoom && <Card {...trapZoom.card} instanceId={trapZoom.id} />}
              <button
                className="card-menu-close"
                onClick={() => {
                  setZoomCard(null);
                  setTrapZoom(null);
                }}
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
                    <span className="target-count">{opp.cardCount}🃏</span>
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

      {/* DISCARD MODAL */}
      <AnimatePresence>
        {showDiscardModal && (
          <DiscardModal
            discardPile={discardPile_}
            onClose={() => setShowDiscardModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ISTORIJA */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="history-panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="history-header">
              <span>📜 Istorija</span>
              <button
                className="history-close"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="history-list" ref={historyRef}>
              {history.length === 0 && (
                <p className="history-empty">Nėra įvykių</p>
              )}
              {history.map((e) => (
                <div
                  key={e.id}
                  className={`history-entry history-entry--${e.type}`}
                >
                  <span className="history-time">{e.time}</span>
                  <span className="history-msg">{e.msg}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TURN CHAIN — ėjimo kortų eilė dešinėje */}
      <AnimatePresence>
        {turnChain?.length > 0 && (
          <motion.div
            className="turn-chain"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="turn-chain-label">Ėjimas</div>
            {turnChain.map((entry, i) => (
              <motion.div
                key={entry.id}
                className={`chain-entry chain-entry--${entry.card.type}`}
                initial={{ opacity: 0, x: 30, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="chain-entry-player">👤 {entry.playerName}</div>
                <div className="chain-entry-card">{entry.card.title}</div>
                <div
                  className={`chain-entry-type chain-entry-type--${entry.card.type}`}
                >
                  {entry.card.type}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* REACTION WINDOW */}
      <AnimatePresence>
        {reactionWindow && (
          <motion.div
            className="reaction-overlay"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="reaction-box">
              <div className="reaction-title">⚡ Reakcijos laikas!</div>
              <div className="reaction-info">
                <span className="reaction-card">
                  {reactionWindow.card?.title || "Veiksmas"}
                </span>
                <span
                  className={`reaction-timer ${reactionSecs <= 2 ? "reaction-timer--urgent" : ""}`}
                >
                  {reactionSecs}s
                </span>
              </div>
              <div className="reaction-progress">
                <motion.div
                  className="reaction-progress-bar"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: reactionWindow.durationMs / 1000,
                    ease: "linear",
                  }}
                />
              </div>
              <div className="reaction-actions">
                {myTraps
                  .filter((tc) => tc.placedAtTurn !== turnNumber)
                  .map((tc) => (
                    <button
                      key={tc.id}
                      className="reaction-btn reaction-btn--trap"
                      onClick={() => {
                        if (tc.card.requiresTarget) setTrapActivating(tc);
                        else activateTrapReaction(tc.id);
                      }}
                    >
                      🪤 {tc.card.title}
                    </button>
                  ))}
                {myCards_
                  .filter((c) => c.isLightning && c.type === "response")
                  .map((c) => (
                    <button
                      key={c.instanceId}
                      className="reaction-btn reaction-btn--response"
                      onClick={() => playCard(c.instanceId)}
                    >
                      🛡 {c.title}
                    </button>
                  ))}
                <button
                  className="reaction-btn reaction-btn--pass"
                  onClick={() => passReaction()}
                >
                  ⏭ Praleisti
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ĖJIMO JUOSTA */}
      <div className={`turn-bar ${isMyTurn ? "turn-bar--mine" : ""}`}>
        {isMyTurn
          ? actionUsed
            ? "✅ Laukiama..."
            : "🐭 TAVO ĖJIMAS!"
          : "Laukiame..."}
      </div>

      {/* POKERIO STALAS */}
      <div className="poker-table-wrap">
        <div className="poker-table">
          {/* FLASH */}
          <AnimatePresence>
            {flashEmoji && (
              <motion.div
                className="table-flash"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.4 }}
              >
                {flashEmoji}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CENTRAS */}
          <div className="table-center">
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
            <div className="pile-wrap">
              <span className="pile-lbl">Išmesta ({discardPile_.length})</span>
              <div
                className="discard-stack clickable"
                onClick={() => setShowDiscardModal(true)}
              >
                {discardPile_.slice(-4).map((card, i) => (
                  <div
                    key={`${card.instanceId}-${i}`}
                    className="discard-mini"
                    style={{
                      background: `${typeColor[card.type]}22`,
                      borderColor: typeColor[card.type] || "#555",
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
          </div>

          {/* MANO IKONAS */}
          <div
            className="player-seat player-seat--me"
            style={{
              left: `${myPos.x}%`,
              top: `${myPos.y}%`,
              transform: "translate(-50%,-50%)",
            }}
          >
            {myTraps.length > 0 && (
              <div className="seat-traps">
                {myTraps.map((tc, ti) => (
                  <div
                    key={tc.id}
                    className="trap-face-down"
                    style={{ transform: `rotate(${(ti - 1) * 12}deg)` }}
                    onClick={() => setTrapMenuTc(tc)}
                  />
                ))}
              </div>
            )}
            <div
              className={`player-icon player-icon--me ${isMyTurn ? "player-icon--active" : ""}`}
            >
              <PawnIcon size={20} />
            </div>
            {iMadMousePending && (
              <motion.div
                className="mad-mouse-pending-badge"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                🐭 MAD MOUSE!
              </motion.div>
            )}
            <div className="seat-name seat-name--me">Tu</div>
            <div className="seat-count">{myCards_.length}🃏</div>
          </div>

          {/* OPONENTAI */}
          {otherPlayers.map((opp, i) => {
            const pos = getOtherPos(i, otherPlayers.length);
            const isActive = currentTurnPlayerId === opp.id;
            const oppTraps = trapsByOwner(opp.id);
            return (
              <div
                key={opp.id}
                className={`player-seat ${isActive ? "player-seat--active" : ""} ${!opp.isConnected ? "player-seat--offline" : ""}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%,-50%)",
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
                {/* 5 punktas — rodo ką priešas daro */}
                {isActive && !isMyTurn && (
                  <motion.div
                    className="opponent-action-hint"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ▶ ėjimas
                  </motion.div>
                )}
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

      {/* ANT STALO KORTOS */}
      {tableCards_.length > 0 && (
        <div className="table-cards-row">
          <span className="table-cards-lbl">🃏 Ant stalo</span>
          {tableCards_.map((tc) => (
            <div
              key={tc.id}
              className={`table-card-chip table-card-chip--${tc.card.type} ${tc.ownerId === mySocketId ? "table-card-chip--mine" : ""}`}
              onClick={() =>
                tc.ownerId === mySocketId ? setTrapMenuTc(tc) : null
              }
              style={{
                cursor: tc.ownerId === mySocketId ? "pointer" : "default",
              }}
            >
              <div className="trap-face-down trap-face-down--sm" />
              <span className="table-card-owner">👤 {tc.ownerName}</span>
              {tc.turnsLeft !== null && (
                <span className="table-card-turns">⏱{tc.turnsLeft}</span>
              )}
              {tc.ownerId === mySocketId && tc.placedAtTurn === turnNumber && (
                <span className="table-card-cooldown">⏳</span>
              )}
              {tc.ownerId === mySocketId && (
                <span className="table-card-hint">👆</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MAD MOUSE BANNER */}
      {iMadMousePending && (
        <motion.div
          className="my-mad-mouse-banner"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
        >
          🐭 MAD MOUSE paskelbtas! Laukiame rato...
        </motion.div>
      )}

      {/* DEŠINĖ PANELĖ */}
      <div className="side-btns">
        <button
          className="btn-history"
          onClick={() => setShowHistory((v) => !v)}
        >
          📜
        </button>
        {canDeclareWin && (
          <motion.button
            className="btn-mad-mouse"
            onClick={declareMadMouse}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
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

      {/* RANKA — 6 punktas: nėra cutoff, 7 punktas: galima scrollinti */}
      <div className="hand-area">
        <div className="hand-header">
          <div className="my-seat-info">
            <div
              className={`player-icon player-icon--me ${isMyTurn ? "player-icon--active" : ""}`}
            >
              <PawnIcon size={18} />
            </div>
            <span className="hand-lbl">
              Tu · {myCards_.length}/{handLimit || 10}🃏
              {iMadMousePending && " 🐭"}
            </span>
          </div>
          {isMyTurn && (
            <div
              className={`action-point ${actionUsed ? "action-point--used" : "action-point--available"}`}
            >
              {actionUsed ? "✅ Laukiama" : "⚡ 1 veiksmas"}
            </div>
          )}
        </div>
        {/* 7 punktas — horizontal scroll, kortos neatsiranda */}
        <div className="hand-cards">
          <AnimatePresence mode="popLayout">
            {myCards_.map((card, i) => (
              <motion.div
                key={card.instanceId}
                className="hand-card"
                style={{
                  marginLeft: i === 0 ? 0 : "clamp(-50px, -12vw, -30px)",
                  zIndex: i,
                }}
                initial={{ y: 80, opacity: 0, scale: 0.7 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -80, opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", damping: 18, stiffness: 200 }}
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
