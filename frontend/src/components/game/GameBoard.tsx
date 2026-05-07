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

// ─── KORTOS MENIU ─────────────────────────────────────────────────────────────
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

// ─── TRAP MENIU (2 punktas) ────────────────────────────────────────────────────
const TrapMenu: React.FC<{
  tc: TableCard;
  isMyTurn: boolean;
  actionUsed: boolean;
  onInspect: () => void;
  onActivate: () => void;
  onClose: () => void;
}> = ({ tc, isMyTurn, actionUsed, onInspect, onActivate, onClose }) => (
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
        {tc.canActivate && isMyTurn && !actionUsed && (
          <button className="cmb cmb--play" onClick={onActivate}>
            ⚡ Aktyvuoti
          </button>
        )}
      </div>
      <button className="card-menu-close" onClick={onClose}>
        ✕
      </button>
    </motion.div>
  </motion.div>
);

// ─── DISCARD MODALAS su savininku (4 punktas) ─────────────────────────────────
const DiscardModal: React.FC<{ discardPile: any[]; onClose: () => void }> = ({
  discardPile,
  onClose,
}) => {
  const typeColor: Record<string, string> = {
    action: "#185FA5",
    trap: "#6B21A8",
    response: "#1D4ED8",
    curse: "#991B1B",
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
        <h3>🗑 Išmestų kortų kaladė ({discardPile.length})</h3>
        <div className="discard-modal-list">
          {discardPile.length === 0 && (
            <p className="empty-msg">Dar nėra išmestų kortų</p>
          )}
          {[...discardPile].reverse().map((card, i) => (
            <div
              key={`${card.instanceId}-${i}`}
              className="discard-row"
              style={{ borderColor: typeColor[card.type] || "#555" }}
            >
              <span className="discard-num">#{discardPile.length - i}</span>
              <span className="discard-title">{card.title}</span>
              {/* Savininkas (4 punktas) */}
              <span className="discard-owner">
                👤 {card.ownerUsername || "?"}
              </span>
              <span
                className="discard-type-label"
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

// ─── PAGRINDINIS KOMPONENTAS ──────────────────────────────────────────────────
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
  } = useGameStore();

  const [menuCard, setMenuCard] = useState<CardType | null>(null);
  const [zoomCard, setZoomCard] = useState<CardType | null>(null);
  const [selectingTarget, setSelectingTarget] = useState<CardType | null>(null);
  const [trapActivating, setTrapActivating] = useState<TableCard | null>(null);
  const [mulliganUsed, setMulliganUsed] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [trapMenuTc, setTrapMenuTc] = useState<TableCard | null>(null);
  const [trapZoom, setTrapZoom] = useState<TableCard | null>(null);

  useEffect(() => {
    if (roomId) initGame(roomId);
  }, [roomId]);

  const myCards_ = myCards || [];
  const reactionTimeLeft = reactionWindow
    ? Math.max(
        0,
        Math.round(
          (reactionWindow.durationMs -
            (Date.now() - reactionWindow.startedAt)) /
            1000,
        ),
      )
    : 0;
  const opponents_ = opponents || [];
  const tableCards_ = tableCards || [];
  const discardPile_ = discardPile || [];

  const isMyTurn = currentTurnPlayerId === mySocketId;
  const iMadMousePending = madMousePlayerId === mySocketId;
  const canDeclareWin =
    myCards_.length >= (handLimit || 10) && !madMousePlayerId;
  const visualLayers = Math.min(Math.floor(deckCount / 4), 12);

  // Visi žaidėjai — aš + oponentai (5 punktas)
  const myInfo = opponents_.find((o) => o.id === socket.id) || {
    id: mySocketId || "",
    username: "Tu",
    cardCount: myCards_.length,
    madMousePending: iMadMousePending,
    isConnected: true,
    curses: [],
  };
  const otherPlayers = opponents_.filter((o) => o.id !== socket.id);

  // VISI žaidėjai aplink stalą — aš viršuje centre, kiti aplinkui (5 punktas)
  // Aš — visada pozicija viršuje centre
  const myPosition = { x: 30, y: 10 };

  // Kiti žaidėjai — aplink stalą
  function getOtherSeatPos(index: number, total: number) {
    if (total === 0) return { x: 50, y: 50 };
    const startAngle = 195;
    const endAngle = 345;
    const angle =
      total === 1
        ? 270
        : startAngle + (index / (total - 1)) * (endAngle - startAngle);
    const rad = angle * (Math.PI / 180);
    const rx = 48,
      ry = 46;
    return { x: 50 + rx * Math.cos(rad), y: 50 + ry * Math.sin(rad) };
  }

  function trapsByOwner(id: string | null) {
    return tableCards_.filter(
      (tc) => tc.ownerId === id && tc.card.type === "trap",
    );
  }

  const myTraps = trapsByOwner(mySocketId);

  const typeColor: Record<string, string> = {
    action: "#185FA5",
    trap: "#6B21A8",
    response: "#1D4ED8",
    curse: "#991B1B",
  };

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
    if (card.requiresTarget) setSelectingTarget(card);
    else playCard(card.instanceId);
  }

  function handleSelectOpponent(oppId: string) {
    if (trapActivating) {
      if (reactionWindow) {
        activateTrapReaction(trapActivating.id, oppId);
      } else {
        activateTrap(trapActivating.id, oppId);
      }
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

      {/* TRAP ZOOM */}
      <AnimatePresence>
        {trapZoom && (
          <motion.div
            className="card-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTrapZoom(null)}
          >
            <motion.div
              className="zoom-card-wrapper"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <Card {...trapZoom.card} instanceId={trapZoom.id} />
              <button
                className="card-menu-close"
                onClick={() => setTrapZoom(null)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
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

      {/* DISCARD MODALAS */}
      <AnimatePresence>
        {showDiscardModal && (
          <DiscardModal
            discardPile={discardPile_}
            onClose={() => setShowDiscardModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ĖJIMO JUOSTA */}
      <div className={`turn-bar ${isMyTurn ? "turn-bar--mine" : ""}`}>
        {isMyTurn
          ? actionUsed
            ? "✅ Veiksmas atliktas..."
            : "🐭 Tavo ėjimas!"
          : "Laukiame..."}
      </div>

      {/* REACTION WINDOW */}
      <AnimatePresence>
        {reactionWindow && (
          <motion.div
            className="reaction-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="reaction-box">
              <div className="reaction-title">⚡ Reakcijos laikas!</div>
              <div className="reaction-info">
                <span className="reaction-card">
                  {reactionWindow.card?.title || "Veiksmas"}
                </span>
                <span className="reaction-timer">{reactionTimeLeft}s</span>
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
                {/* Mano trap kortos kurias galiu aktyvuoti */}
                {myTraps
                  .filter((tc) => tc.canActivate || tc.card.trigger)
                  .map((tc) => (
                    <button
                      key={tc.id}
                      className="reaction-btn reaction-btn--trap"
                      onClick={() => {
                        if (tc.card.requiresTarget) setTrapActivating(tc);
                        else activateTrapReaction(tc.id);
                      }}
                    >
                      🪤 Aktyvuoti: {tc.card.title}
                    </button>
                  ))}
                {/* Response kortos */}
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
                  onClick={passReaction}
                >
                  ⏭ Praleisti
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POKERIO STALAS — VISI žaidėjai (5 punktas) */}
      <div className="poker-table-wrap">
        <div className="poker-table">
          {/* CENTRAS — discard (1 punktas: po kalade) ir kaladė */}
          <div className="table-center">
            {/* Kaladė — pirma */}
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

            {/* Discard — po kalade (1 punktas) */}
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
                      background:
                        card.type === "action"
                          ? "#E6F1FB"
                          : card.type === "trap"
                            ? "#F3E8FF"
                            : card.type === "response"
                              ? "#DBEAFE"
                              : "#FEE2E2",
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
          </div>

          {/* MANO IKONAS — viršuje centre (5 punktas) */}
          <div
            className="player-seat player-seat--me"
            style={{
              left: `${myPosition.x}%`,
              top: `${myPosition.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {myTraps.length > 0 && (
              <div className="seat-traps">
                {myTraps.map((tc, ti) => (
                  <div
                    key={tc.id}
                    className="trap-face-down"
                    style={{ transform: `rotate(${(ti - 1) * 12}deg)` }}
                    title={tc.card.title}
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

          {/* KITI ŽAIDĖJAI aplink stalą (5 punktas) */}
          {otherPlayers.map((opp, i) => {
            const pos = getOtherSeatPos(i, otherPlayers.length);
            const isActive = currentTurnPlayerId === opp.id;
            const oppTraps = trapsByOwner(opp.id);
            return (
              <div
                key={opp.id}
                className={`player-seat ${isActive ? "player-seat--active" : ""} ${!opp.isConnected ? "player-seat--offline" : ""}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
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

      {/* STALO KORTOS — trap ir curse (2 punktas) */}
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
              {/* Savininkas (4 punktas) */}
              <span className="table-card-owner">👤 {tc.ownerName}</span>
              {tc.ownerId === mySocketId && (
                <span className="table-card-hint">👆</span>
              )}
              {tc.turnsLeft !== null && (
                <span className="table-card-turns">⏱{tc.turnsLeft}</span>
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
              {iMadMousePending && " 🐭"}
            </span>
          </div>
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
