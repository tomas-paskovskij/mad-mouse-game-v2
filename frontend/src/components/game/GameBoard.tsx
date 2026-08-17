import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/useGameStore";
import type { CardType, TableCard } from "../../store/useGameStore";
import { socket } from "../../services/socket";
import Card from "./Card";
import "./GameBoard.css";

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const Avatar: React.FC<{
  name: string;
  size?: number;
  active?: boolean;
  isMe?: boolean;
  cardCount?: number;
}> = ({ name, size = 36, active, isMe, cardCount }) => {
  const initials = name.slice(0, 2).toUpperCase();
  const palette = [
    "#4a7fd4",
    "#c084fc",
    "#f472b6",
    "#fb923c",
    "#34d399",
    "#f87171",
    "#60a5fa",
  ];
  const color = palette[name.charCodeAt(0) % palette.length];
  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: isMe ? "#1d3a6e" : "#1e1b2e",
          border: `2px solid ${active ? "#4ade80" : isMe ? "#60a5fa" : "#2d2a45"}`,
          boxShadow: active
            ? "0 0 0 3px rgba(74,222,128,0.25)"
            : isMe
              ? "0 0 0 3px rgba(96,165,250,0.2)"
              : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.34,
          fontWeight: 800,
          color,
          flexShrink: 0,
          transition: "all 0.2s",
        }}
      >
        {initials}
      </div>
      {cardCount !== undefined && (
        <div
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            background: "#1d4ed8",
            color: "white",
            fontSize: "0.48rem",
            fontWeight: 900,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid #0d0d1a",
            padding: "0 3px",
          }}
        >
          {cardCount}
        </div>
      )}
    </div>
  );
};

// ─── CHAIN ENTRY TYPE ─────────────────────────────────────────────────────────
interface ChainEntry {
  id: number;
  card: CardType;
  playerName: string;
  playerId: string;
  isTrap?: boolean;
}

// ─── FULL SCREEN PLAY MODAL ───────────────────────────────────────────────────
const PlayModal: React.FC<{
  entry: ChainEntry;
  chain: ChainEntry[];
  onSkip: () => void;
}> = ({ entry, chain, onSkip }) => (
  <motion.div
    className="play-modal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="play-modal-backdrop" />
    <div className="play-modal-inner">
      <div className="play-modal-who">
        <Avatar name={entry.playerName} size={28} />
        <span className="play-modal-who-name">{entry.playerName} played</span>
      </div>
      <motion.div
        initial={{ scale: 0.2, y: -120, rotate: -18, opacity: 0 }}
        animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.4, y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 13, stiffness: 160 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {entry.isTrap ? (
          <div className="play-modal-facedown">
            <span className="play-modal-facedown-q">?</span>
            <span className="play-modal-facedown-lbl">🪤 TRAP</span>
          </div>
        ) : (
          <div className="play-modal-card-wrap">
            <Card {...entry.card} instanceId={`modal-${entry.id}`} />
          </div>
        )}
        {!entry.isTrap && (
          <p className="play-modal-desc">{entry.card.description}</p>
        )}
      </motion.div>
      <div className="play-modal-timer-bar-wrap">
        <motion.div
          className="play-modal-timer-bar"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 4.5, ease: "linear" }}
        />
      </div>
      {/* Mini chain preview */}
      {chain.length > 1 && (
        <div className="play-modal-chain-preview">
          <div className="section-label">CURRENT CHAIN WILL UPDATE</div>
          <div className="chain-row">
            {chain.map((e, i) => (
              <React.Fragment key={e.id}>
                <div
                  className={`chain-slot ${e.id === entry.id ? "chain-slot--active" : ""}`}
                >
                  <span className="chain-num">{i + 1}</span>
                  {e.isTrap ? (
                    <div className="chain-facedown">?</div>
                  ) : (
                    <Card {...e.card} instanceId={`pm-${e.id}`} compact />
                  )}
                </div>
                {i < chain.length - 1 && <span className="chain-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
    <button className="skip-btn" onClick={onSkip}>
      Praleisti ▶
    </button>
  </motion.div>
);

// ─── CARD MENU ────────────────────────────────────────────────────────────────
const CardMenu: React.FC<{
  card: CardType;
  isMyTurn: boolean;
  actionUsed: boolean;
  pendingAction: any;
  turnNumber: number;
  mulliganUsed: boolean;
  onPlay: () => void;
  onPlaceTrap: () => void;
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
  onPlaceTrap,
  onDiscard,
  onInspect,
  onMulligan,
  onClose,
}) => {
  const isTrap = card.type === "trap";
  const canPlay =
    (isMyTurn && !actionUsed) ||
    (card.isLightning &&
      (card.type === "interrupt" || card.type === "response") &&
      (card.effect === "shield" || !!pendingAction));
  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card-menu"
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 2, y: 0 }}
        exit={{ scale: 0.85 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <Card {...card} />
        </div>
        <div className="menu-actions">
          <button className="menu-btn menu-btn--inspect" onClick={onInspect}>
            🔍 Peržiūrėti
          </button>
          <button className="menu-btn menu-btn--play" onClick={onPlay}>
            ▶ Panaudoti
          </button>
          <button className="menu-btn menu-btn--trap" onClick={onPlaceTrap}>
            🪤 Padėti ant stalo
          </button>
          {turnNumber === 0 && !mulliganUsed && (
            <button
              className="menu-btn menu-btn--mulligan"
              onClick={onMulligan}
            >
              🔀 Mulligan
            </button>
          )}
          <button className="menu-btn menu-btn--discard" onClick={onDiscard}>
            🗑 Išmesti
          </button>
        </div>
        <button className="overlay-close" onClick={onClose}>
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
      className="overlay"
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
        <div className="trap-menu-header">
          <span className="trap-menu-badge">🪤 TRAP</span>
          <span className="trap-menu-title">{tc.card.title}</span>
        </div>
        <div className="menu-actions">
          <button className="menu-btn menu-btn--inspect" onClick={onInspect}>
            🔍 Peržiūrėti efektą
          </button>
          {canActivate && (
            <button className="menu-btn menu-btn--play" onClick={onActivate}>
              ⚡ Aktyvuoti
            </button>
          )}
          {tc.placedAtTurn === turnNumber && (
            <p className="cooldown-note">⏳ Galima aktyvuoti kitą ėjimą</p>
          )}
        </div>
        <button className="overlay-close" onClick={onClose}>
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── DISCARD MODAL ────────────────────────────────────────────────────────────
const DiscardModal: React.FC<{ pile: any[]; onClose: () => void }> = ({
  pile,
  onClose,
}) => {
  const colors: Record<string, string> = {
    action: "#4a7fd4",
    trap: "#a78bfa",
    interrupt: "#34d399",
    response: "#34d399",
    curse: "#f87171",
    goal: "#fbbf24",
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
        <div className="modal-header">
          <h3>Discard Pile History</h3>
          <button
            className="overlay-close overlay-close--inline"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="discard-list">
          {pile.length === 0 && (
            <p className="empty-note">Dar nėra išmestų kortų</p>
          )}
          {[...pile].reverse().map((card, i) => (
            <div key={`${card.instanceId}-${i}`} className="discard-row">
              <span className="discard-idx">{pile.length - i}</span>
              <span className="discard-time">{card.time || "--:--"}</span>
              <Avatar name={card.ownerUsername || "?"} size={20} />
              <span className="discard-who">{card.ownerUsername || "?"}</span>
              <span className="discard-verb">played</span>
              <span
                className="discard-card-name"
                style={{ color: colors[card.type] || "white" }}
              >
                {card.title}
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

// ─── REACTION WINDOW ──────────────────────────────────────────────────────────
const ReactionWindow: React.FC<{
  rw: any;
  secs: number;
  myTraps: TableCard[];
  myCards: CardType[];
  turnNumber: number;
  onPass: () => void;
  onPlayCard: (id: string) => void;
  onTrapReaction: (id: string, targetId?: string) => void;
  onSetTrapActivating: (tc: TableCard) => void;
}> = ({
  rw,
  secs,
  myTraps,
  myCards,
  turnNumber,
  onPass,
  onPlayCard,
  onTrapReaction,
  onSetTrapActivating,
}) => (
  <motion.div
    className="reaction-panel"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 20, opacity: 0 }}
  >
    <div className="reaction-header">
      <span className="reaction-title">⚡ Reakcijos laikas!</span>
      <span
        className={`reaction-secs ${secs <= 2 ? "reaction-secs--urgent" : ""}`}
      >
        {secs}s
      </span>
    </div>
    <div className="reaction-card-name">{rw.card?.title || "Veiksmas"}</div>
    <div className="reaction-progress-track">
      <motion.div
        className="reaction-progress-fill"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: rw.durationMs / 1000, ease: "linear" }}
      />
    </div>
    <div className="reaction-btns">
      {myTraps
        .filter((tc) => tc.placedAtTurn !== turnNumber)
        .map((tc) => (
          <button
            key={tc.id}
            className="rbtn rbtn--trap"
            onClick={() =>
              tc.card.requiresTarget
                ? onSetTrapActivating(tc)
                : onTrapReaction(tc.id)
            }
          >
            🪤 {tc.card.title}
          </button>
        ))}
      {myCards
        .filter(
          (c) =>
            c.isLightning && (c.type === "interrupt" || c.type === "response"),
        )
        .map((c) => (
          <button
            key={c.instanceId}
            className="rbtn rbtn--interrupt"
            onClick={() => onPlayCard(c.instanceId)}
          >
            🛡 {c.title}
          </button>
        ))}
      <button className="rbtn rbtn--pass" onClick={onPass}>
        ⏭ Praleisti
      </button>
    </div>
  </motion.div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const GameBoard: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    // Būsenos (State)
    myCards,
    myTrapZoneCards,
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

    // Funkcijos (Actions)
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
  const [trapMenuTc, setTrapMenuTc] = useState<TableCard | null>(null);
  const [trapZoom, setTrapZoom] = useState<TableCard | null>(null);
  const [selectingTarget, setSelectTarget] = useState<CardType | null>(null);
  const [trapActivating, setTrapActivating] = useState<TableCard | null>(null);
  const [mulliganUsed, setMulliganUsed] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<
    { id: number; msg: string; type: string; time: string }[]
  >([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [reactionSecs, setReactionSecs] = useState(0);
  const [chain, setChain] = useState<ChainEntry[]>([]);
  const [stageActive, setStageActive] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const histRef = useRef<HTMLDivElement>(null);
  const reactionIv = useRef<any>(null);
  const stageTimer = useRef<any>(null);
  const elapsedIv = useRef<any>(null);

  useEffect(() => {
    if (roomId) initGame(roomId);
  }, [roomId]);

  // elapsed timer (00:XX)
  useEffect(() => {
    elapsedIv.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(elapsedIv.current);
  }, []);

  // chain socket events
  useEffect(() => {
    const onPlayed = (data: {
      card: CardType;
      playerName: string;
      playerId: string;
      isTrap?: boolean;
    }) => {
      const entry: ChainEntry = { id: Date.now(), ...data };
      setChain((prev) => {
        const next = [...prev, entry];
        if (!stageActive) {
          setStageActive(true);
          setStageIdx(next.length - 1);
          scheduleNext(next, next.length - 1);
        }
        return next;
      });
    };
    const onClear = () => {
      clearTimeout(stageTimer.current);
      setChain([]);
      setStageActive(false);
      setStageIdx(0);
    };
    socket.on("card_played_display", onPlayed);
    socket.on("turn_chain_clear", onClear);
    return () => {
      socket.off("card_played_display", onPlayed);
      socket.off("turn_chain_clear", onClear);
    };
  }, [stageActive]);

  function scheduleNext(ch: ChainEntry[], idx: number) {
    clearTimeout(stageTimer.current);
    stageTimer.current = setTimeout(() => {
      setChain((prev) => {
        if (idx + 1 < prev.length) {
          setStageIdx(idx + 1);
          scheduleNext(prev, idx + 1);
        } else setStageActive(false);
        return prev;
      });
    }, 5000);
  }
  function stageDone() {
    clearTimeout(stageTimer.current);
    setChain((prev) => {
      if (stageIdx + 1 < prev.length) {
        const n = stageIdx + 1;
        setStageIdx(n);
        scheduleNext(prev, n);
      } else setStageActive(false);
      return prev;
    });
  }

  // notifications → history + flash
  useEffect(() => {
    if (!notification) return;
    const time = new Date().toLocaleTimeString("lt-LT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setHistory((p) => [
      ...p.slice(-49),
      {
        id: Date.now(),
        msg: notification.message,
        type: notification.type,
        time,
      },
    ]);
    const em: Record<string, string> = {
      action: "⚡",
      trap: "🪤",
      interrupt: "🛡",
      response: "🛡",
      curse: "💀",
      turn: "▶",
      skip: "⏭",
      mad_mouse: "🐭",
    };
    setFlash(em[notification.type] || "⚡");
    setTimeout(() => setFlash(null), 900);
  }, [notification]);
  useEffect(() => {
    if (histRef.current)
      histRef.current.scrollTop = histRef.current.scrollHeight;
  }, [history]);

  // reaction timer countdown
  useEffect(() => {
    if (reactionWindow) {
      setReactionSecs(Math.round(reactionWindow.durationMs / 1000));
      reactionIv.current = setInterval(
        () =>
          setReactionSecs((s) => {
            if (s <= 1) {
              clearInterval(reactionIv.current);
              return 0;
            }
            return s - 1;
          }),
        1000,
      );
    } else {
      clearInterval(reactionIv.current);
      setReactionSecs(0);
    }
    return () => clearInterval(reactionIv.current);
  }, [reactionWindow?.startedAt]);

  const myCards_ = myCards || [];
  const myTrapZoneCards_ = myTrapZoneCards || [];
  const opponents_ = opponents || [];
  const tableCards_ = tableCards || [];
  const discardPile_ = discardPile || [];
  const isMyTurn = currentTurnPlayerId === mySocketId;
  const iMadMouse = madMousePlayerId === mySocketId;
  const canDeclare =
    myCards_.length >= (handLimit || 100000) && !madMousePlayerId;
  const vLayers = Math.min(Math.floor(deckCount / 4), 12);
  const otherPlayers = opponents_.filter((o) => o.id !== socket.id);
  const myTraps = tableCards_.filter(
    (tc) => tc.ownerId === mySocketId && tc.card.type === "trap",
  );
  const trapCards_ = tableCards_.filter((tc) => tc.card.type === "trap");
  // ordered players: others first, then me
  const allOrdered = [
    ...otherPlayers,
    opponents_.find((o) => o.id === mySocketId),
  ].filter(Boolean) as any[];

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  function playMenuCard(card: CardType) {
    setMenuCard(null);
    if (
      (card.type === "interrupt" || card.type === "response") &&
      card.isLightning
    ) {
      playCard(card.instanceId);
      return;
    }
    if (card.requiresTarget) setSelectTarget(card);
    else playCard(card.instanceId);
  }
  function handleSelectOpp(id: string) {
    if (trapActivating) {
      reactionWindow
        ? activateTrapReaction(trapActivating.id, id)
        : activateTrap(trapActivating.id, id);
      setTrapActivating(null);
      return;
    }
    if (selectingTarget) {
      playCard(selectingTarget.instanceId, id);
      setSelectTarget(null);
      return;
    }
    if (actionNeedsTarget) selectTarget(id);
  }
  const needsTarget = selectingTarget || actionNeedsTarget || trapActivating;

  const carouselRef = useRef<HTMLDivElement>(null);

  // Peliuko ratuko pavertimas į horizontalų scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += e.deltaY;
    }
  };

  // ── WINNER ────────────────────────────────────────────────────────────────
  if (winner)
    return (
      <div className="winner-screen">
        <motion.div
          className="winner-box"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            className="winner-mouse"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🐭
          </motion.div>
          <h2>MAD MOUSE!</h2>
          <p>{winner} laimi!</p>
          <div className="winner-btns">
            <button className="wbtn wbtn--restart" onClick={restartGame}>
              🔄 Iš naujo
            </button>
            <button
              className="wbtn wbtn--lobby"
              onClick={() => navigate("/lobby")}
            >
              🏠 Lobby
            </button>
          </div>
        </motion.div>
      </div>
    );

  // console.log("trapcards", trapCards_);

  return (
    <div className={`board rounded-[20px] ${isMyTurn ? "board--my-turn" : ""}`}>
      {/* PLAY MODAL */}
      <AnimatePresence>
        {stageActive && chain[stageIdx] && (
          <PlayModal entry={chain[stageIdx]} chain={chain} onSkip={stageDone} />
        )}
      </AnimatePresence>
      {/* NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`notif notif--${notification.type}`}
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      {/* CARD MENU */}
      <AnimatePresence>
        {menuCard && (
          <CardMenu
            card={menuCard}
            isMyTurn={isMyTurn}
            actionUsed={actionUsed}
            pendingAction={pendingAction}
            turnNumber={turnNumber}
            mulliganUsed={mulliganUsed}
            onPlay={() => playMenuCard(menuCard)}
            onPlaceTrap={() => {
              setMenuCard(null);
              playCard(menuCard.instanceId);
            }}
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
      {/* TRAP MENU */}
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
              tc.card.requiresTarget
                ? setTrapActivating(tc)
                : activateTrap(tc.id);
            }}
            onClose={() => setTrapMenuTc(null)}
          />
        )}
      </AnimatePresence>
      {/* ZOOM */}
      <AnimatePresence>
        {(zoomCard || trapZoom) && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setZoomCard(null);
              setTrapZoom(null);
            }}
          >
            <motion.div
              className="zoom-wrap"
              initial={{ scale: 0.5 }}
              animate={{ scale: 2.55 }}
              exit={{ scale: 0.5 }}
            >
              {zoomCard && <Card {...zoomCard} />}
              {trapZoom && <Card {...trapZoom.card} instanceId={trapZoom.id} />}
              <button
                className="overlay-close"
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
      {/* TARGET */}
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
                    onClick={() => handleSelectOpp(opp.id)}
                  >
                    <Avatar name={opp.username} size={26} />
                    <span>{opp.username}</span>
                    <span className="target-count">{opp.cardCount}🃏</span>
                  </button>
                ))}
              </div>
              <button
                className="btn-cancel"
                onClick={() => {
                  setSelectTarget(null);
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
      {/* INSPECT */}
      <AnimatePresence>
        {inspectResult && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal modal--wide">
              <h3>🔍 {inspectResult.targetUsername}</h3>
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
              <h3>🗡 {inspectStealResult.targetUsername}</h3>
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
        {showDiscard && (
          <DiscardModal
            pile={discardPile_}
            onClose={() => setShowDiscard(false)}
          />
        )}
      </AnimatePresence>
      {/* HISTORY PANEL */}
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
                className="overlay-close"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="history-list" ref={histRef}>
              {history.length === 0 && (
                <p className="empty-note">Nėra įvykių</p>
              )}
              {history.map((e) => (
                <div key={e.id} className={`hist-entry hist-entry--${e.type}`}>
                  <span className="hist-time">{e.time}</span>
                  <span className="hist-msg">{e.msg}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* REACTION */}
      <AnimatePresence>
        {reactionWindow && (
          <ReactionWindow
            rw={reactionWindow}
            secs={reactionSecs}
            myTraps={myTraps}
            myCards={myCards_}
            turnNumber={turnNumber}
            onPass={passReaction}
            onPlayCard={(id) => playCard(id)}
            onTrapReaction={(id, tid) => activateTrapReaction(id, tid)}
            onSetTrapActivating={setTrapActivating}
          />
        )}
      </AnimatePresence>
      {/* ══════════════════════════════════════════════════════════════════════
          MAIN LAYOUT — 8 VARIANT
         ══════════════════════════════════════════════════════════════════════ */}
      {/* TOP BAR: Round | Turn badge | Timer */}

      <header className="top-bar">
        <span className="top-round">Round 1</span>
        <div className={`turn-badge ${isMyTurn ? "turn-badge--mine" : ""}`}>
          {isMyTurn
            ? "Your turn"
            : opponents_.find((o) => o.id === currentTurnPlayerId)?.username ||
              "..."}
          {isMyTurn && !actionUsed && <span className="ap-dot">⚡</span>}
        </div>
        {/* SIDE BUTTONS */}
        <div className="side-btns">
          <button
            className="side-btn"
            onClick={() => setShowHistory((v) => !v)}
            title="Istorija"
          >
            📜
          </button>
          {canDeclare && (
            <motion.button
              className="side-btn side-btn--mm"
              onClick={declareMadMouse}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              🐭
            </motion.button>
          )}
        </div>
        <span className="top-timer">{fmt(elapsed)}</span>
      </header>

      {/* MAIN CONTENT AND SIDE SECTION */}
      <div className="main-content-side-section">
        {/* MAIN CONTENT SECTION */}
        <div className="main-content-section flex-1">
          {/* PLAYERS IN ORDER */}
          <section className="players-section">
            <div className="section-label">PLAYERS IN ORDER</div>
            <div className="players-row">
              {allOrdered.map((p) => {
                if (!p) return null;
                const isMe = p.id === mySocketId;
                const isActive = currentTurnPlayerId === p.id;
                const isMM = madMousePlayerId === p.id;
                const cnt = isMe ? myCards_.length : p.cardCount;
                return (
                  <div
                    key={p.id}
                    className={`player-slot ${isActive ? "player-slot--active" : ""} ${isMe ? "player-slot--me" : ""}`}
                  >
                    <Avatar
                      name={p.username}
                      size={38}
                      active={isActive}
                      isMe={isMe}
                      cardCount={cnt}
                    />
                    <span className="player-name">
                      {isMe ? "You" : p.username}
                    </span>
                    {isMM && (
                      <motion.span
                        className="mm-badge"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      >
                        🐭
                      </motion.span>
                    )}
                    {!p.isConnected && (
                      <span className="offline-badge">📵</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
          {/* CHAIN — WILL RESOLVE IN ORDER */}
          <section className="chain-section">
            <div className="section-label">CHAIN (WILL RESOLVE IN ORDER)</div>
            <div className="chain-row">
              {chain.length === 0 && (
                <span className="chain-empty">Nėra aktyvių kortų</span>
              )}
              {chain.map((e, i) => (
                <React.Fragment key={e.id}>
                  <div
                    className={`chain-slot ${stageActive && stageIdx === i ? "chain-slot--active" : i < stageIdx ? "chain-slot--done" : ""}`}
                  >
                    <span className="chain-num">{i + 1}</span>
                    {e.isTrap ? (
                      <div className="chain-facedown">?</div>
                    ) : (
                      <Card {...e.card} instanceId={`chain-${e.id}`} compact />
                    )}
                    <span className="chain-player">
                      {e.playerName.slice(0, 6)}
                    </span>
                  </div>
                  {i < chain.length - 1 && (
                    <span className="chain-arrow">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>
          {/* MIDDLE AREA: Traps + Deck + Discard (dešinėje) */}
          <section className="middle-section">
            {/* Traps */}
            <div className="traps-area">
              <div className="section-label">TRAPS ON TABLE (FACE DOWN)</div>
              <div className="traps-row">
                {trapCards_.map((tc) => (
                  <div
                    key={tc.id}
                    className={`trap-chip ${tc.ownerId === mySocketId ? "trap-chip--mine" : ""}`}
                    onClick={() =>
                      tc.ownerId === mySocketId ? setTrapMenuTc(tc) : null
                    }
                  >
                    <div className="trap trap-facedown">
                      {tc.ownerId === mySocketId ? "🪤" : "?"}
                    </div>
                    <span className="trap-owner">
                      {tc.ownerName.slice(0, 4)}
                    </span>
                    {tc.placedAtTurn === turnNumber &&
                      tc.ownerId === mySocketId && (
                        <span className="trap-cooldown-dot">⏳</span>
                      )}
                  </div>
                ))}
                <div className="trap trap-add">+</div>
              </div>
            </div>
          </section>
          {/* FLASH */}
          <AnimatePresence>
            {flash && (
              <motion.div
                className="flash-center"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.4 }}
              >
                {flash}
              </motion.div>
            )}
          </AnimatePresence>
          {/* MAD MOUSE banner */}
          {iMadMouse && (
            <motion.div
              className="mm-banner"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
            >
              🐭 MAD MOUSE paskelbtas! Laukiame rato...
            </motion.div>
          )}
        </div>
        {/* MAIN SIDE SECTION */}
        <div className="main-side-section w-[150px] shrink-0">
          {/* Deck + Discard — DEŠINĖJE */}
          <div className="piles-center">
            <div className="pile-col">
              <div
                className={`deck-stack ${isMyTurn && !actionUsed && myCards_.length < (handLimit || 100000) ? "deck-stack--active" : ""}`}
                style={{ "--layers": vLayers } as any}
                onClick={() =>
                  isMyTurn &&
                  !actionUsed &&
                  myCards_.length < (handLimit || 100000) &&
                  drawCard()
                }
              >
                <span className="deck-num">{deckCount}</span>
              </div>
              <span className="pile-label">DECK</span>
            </div>
            <div className="pile-col">
              <div
                className="discard-pile clickable"
                onClick={() => setShowDiscard(true)}
              >
                {discardPile_.slice(-3).map((c, i) => (
                  <div
                    key={`${c.instanceId}-${i}`}
                    className="discard-mini"
                    style={{
                      transform: `rotate(${(i - 1) * 9}deg) translateY(${i * -2}px)`,
                      zIndex: i,
                    }}
                  />
                ))}
                {discardPile_.length > 0 && (
                  <span className="discard-count-badge">
                    {discardPile_.length}
                  </span>
                )}
                {discardPile_.length === 0 && (
                  <span className="pile-empty-lbl">–</span>
                )}
              </div>
              <span className="pile-label">DISCARD</span>
            </div>
          </div>
          <div>
            <button className="end-turn-btn" onClick={() => endTurn()}>
              End turn
            </button>
          </div>
        </div>
      </div>
      {/* HAND */}
      <section className="hand-section">
        <div className="hand-label">YOUR HAND ({myCards_.length})</div>
        <div
          className="hand-carousel-container"
          ref={carouselRef}
          onWheel={handleWheel}
        >
          <div className="hand-cards-track">
            <AnimatePresence mode="popLayout">
              {myCards_.map((card: any, i: number) => (
                <motion.div
                  key={card.instanceId}
                  layout
                  className="hand-card-item"
                  style={{
                    marginLeft: i === 0 ? 0 : "clamp(-1px, -1vw, -1px)",
                    zIndex: i,
                  }}
                  initial={{ y: 80, opacity: 0, scale: 0.7 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -80, opacity: 0, scale: 0.7 }}
                  transition={{ type: "spring", damping: 18, stiffness: 200 }}
                  whileHover={{
                    y: -25,
                    zIndex: 999,
                    transition: { duration: 0.1 },
                  }}
                  onClick={() => !card.hidden && setMenuCard(card)}
                >
                  {card.hidden ? (
                    <div className="card-hidden-slot">?</div>
                  ) : (
                    <Card {...card} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {myCards_.length === 0 && (
            <p className="hand-cards-empty">
              Rankoje nėra kortų — trauk iš kaladės!
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default GameBoard;
