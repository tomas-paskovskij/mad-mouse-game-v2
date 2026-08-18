import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useGameStore } from "../../store/useGameStore";
import type { CardType, TableCard } from "../../store/useGameStore";
import { socket } from "../../services/socket";

// Custom Hooks
import { useGameChain } from "../../hooks/useGameChain";
import { useGameHistory } from "../../hooks/useGameHistory";
import { useGameTimer } from "../../hooks/useGameTimer";

// Komponentai
import { HandSection } from "./HandSection";
import { PilesSection } from "./PilesSection";
import { ReactionWindow } from "./ReactionWindow";
import { PlayModal } from "./modals/PlayModal";
import { CardMenu } from "./modals/CardMenu";
import { TrapMenu } from "./modals/TrapMenu";
import { DiscardModal } from "./modals/DiscardModal";
import { WinnerModal } from "./modals/WinnerModal";
import { ChainSection } from "./ChainSection";
import { TrapsSection } from "./TrapsSection";
import { TopBar } from "./TopBar";
import { PlayersSection } from "./PlayersSection";

// Iškelti nauji komponentai
import { NotificationBanner } from "./modals/NotificationBanner";
import { ZoomOverlay } from "./modals/ZoomOverlay";
import { TargetSelectionModal } from "./modals/TargetSelectionModal";
import { InspectModal } from "./modals/InspectModal";
import { InspectStealModal } from "./modals/InspectStealModal";
import { HistoryPanel } from "./HistoryPanel";

import "./GameBoard.css";

const GameBoard: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // Store
  const {
    myCards,
    opponents,
    currentTurnPlayerId,
    deckCount,
    discardPile,
    tableCards,
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

  // Custom Hooks
  const { chain, stageActive, stageIdx, stageDone } = useGameChain();
  const { history, flash, histRef } = useGameHistory();
  const { elapsed, reactionSecs } = useGameTimer();

  // Vietinė būsena (Local State)
  const [menuCard, setMenuCard] = useState<CardType | null>(null);
  const [zoomCard, setZoomCard] = useState<CardType | null>(null);
  const [trapMenuTc, setTrapMenuTc] = useState<TableCard | null>(null);
  const [trapZoom, setTrapZoom] = useState<TableCard | null>(null);
  const [selectingTarget, setSelectingTarget] = useState<CardType | null>(null);
  const [trapActivating, setTrapActivating] = useState<TableCard | null>(null);
  const [mulliganUsed, setMulliganUsed] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (roomId) initGame(roomId);
  }, [roomId, initGame]);

  // Pagalbiniai apskaičiavimai
  const myCards_ = myCards || [];
  const opponents_ = opponents || [];
  const tableCards_ = tableCards || [];
  const discardPile_ = discardPile || [];

  const isMyTurn = currentTurnPlayerId === mySocketId;
  const iMadMouse = madMousePlayerId === mySocketId;
  const canDeclare =
    myCards_.length >= (handLimit || 100000) && !madMousePlayerId;

  const otherPlayers = opponents_.filter((o) => o.id !== socket.id);
  const myTraps = tableCards_.filter(
    (tc) => tc.ownerId === mySocketId && tc.card.type === "trap",
  );
  const trapCards_ = tableCards_.filter((tc) => tc.card.type === "trap");

  const allOrdered = [
    ...otherPlayers,
    opponents_.find((o) => o.id === mySocketId),
  ].filter(Boolean) as any[];

  function playMenuCard(card: CardType) {
    setMenuCard(null);

    if (
      (card.type === "interrupt" || card.type === "response") &&
      card.isLightning
    ) {
      playCard(card.instanceId);
      return;
    }

    if (card.requiresTarget) setSelectingTarget(card);
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
      setSelectingTarget(null);
      return;
    }

    if (actionNeedsTarget) selectTarget(id);
  }

  const needsTarget = selectingTarget || actionNeedsTarget || trapActivating;

  if (winner) {
    return (
      <WinnerModal
        winner={winner}
        onRestart={restartGame}
        onLobby={() => navigate("/lobby")}
      />
    );
  }

  return (
    <div className={`board rounded-[20px] ${isMyTurn ? "board--my-turn" : ""}`}>
      {/* MODALAI IR PRANEŠIMAI */}
      <AnimatePresence>
        {stageActive && chain[stageIdx] && (
          <PlayModal entry={chain[stageIdx]} chain={chain} onSkip={stageDone} />
        )}
      </AnimatePresence>

      <NotificationBanner notification={notification} />

      <AnimatePresence>
        {menuCard && (
          <CardMenu
            card={menuCard}
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

      <ZoomOverlay
        zoomCard={zoomCard}
        trapZoom={trapZoom}
        onClose={() => {
          setZoomCard(null);
          setTrapZoom(null);
        }}
      />

      <TargetSelectionModal
        needsTarget={needsTarget}
        selectingTarget={selectingTarget}
        actionNeedsTarget={actionNeedsTarget}
        trapActivating={trapActivating}
        otherPlayers={otherPlayers}
        onSelectOpponent={handleSelectOpp}
        onCancel={() => {
          setSelectingTarget(null);
          setTrapActivating(null);
          clearActionNeedsTarget();
        }}
      />

      <InspectModal inspectResult={inspectResult} onClose={clearInspect} />

      <InspectStealModal
        inspectStealResult={inspectStealResult}
        onPickCard={inspectStealPick}
        onClose={clearInspectSteal}
      />

      <AnimatePresence>
        {showDiscard && (
          <DiscardModal
            pile={discardPile_}
            onClose={() => setShowDiscard(false)}
          />
        )}
      </AnimatePresence>

      <HistoryPanel
        showHistory={showHistory}
        history={history}
        histRef={histRef}
        onClose={() => setShowHistory(false)}
      />

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

      {/* VIRŠUTINĖ JUOSTA (TOP BAR) */}
      <TopBar
        isMyTurn={isMyTurn}
        opponents={opponents_}
        currentTurnPlayerId={currentTurnPlayerId}
        actionUsed={actionUsed}
        canDeclare={canDeclare}
        elapsedSeconds={elapsed}
        onToggleHistory={() => setShowHistory((v) => !v)}
        onDeclareMadMouse={declareMadMouse}
      />

      {/* PAGRINDINIS ŽAIDIMO LAUKAS */}
      <div className="main-content-side-section">
        <div className="main-content-section flex-1">
          {/* ŽAIDĖJŲ SĄRAŠAS */}
          <PlayersSection
            allOrdered={allOrdered || []}
            mySocketId={mySocketId}
            currentTurnPlayerId={currentTurnPlayerId}
            madMousePlayerId={madMousePlayerId}
            myCardsCount={myCards_.length}
          />

          {/* GRANDINĖ (CHAIN) */}
          <ChainSection
            chain={chain}
            stageActive={stageActive}
            stageIdx={stageIdx}
          />

          {/* TRAPŲ ZONA */}
          <TrapsSection
            trapCards={trapCards_}
            mySocketId={mySocketId}
            turnNumber={turnNumber}
            onSelectTrap={(tc) => setTrapMenuTc(tc)}
          />

          <AnimatePresence>
            {flash && (
              <motion.div
                className="flash-center"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 2 }}
              >
                {flash}
              </motion.div>
            )}
          </AnimatePresence>

          {iMadMouse && (
            <div className="mm-banner">
              🐭 MAD MOUSE paskelbtas! Laukiame rato...
            </div>
          )}
        </div>

        {/* KALODĖS IR ĖJIMO PABAIGA */}
        <PilesSection
          deckCount={deckCount}
          discardPile={discardPile_}
          isMyTurn={isMyTurn}
          actionUsed={actionUsed}
          myCardsCount={myCards_.length}
          handLimit={handLimit}
          onDrawCard={drawCard}
          onEndTurn={endTurn}
          onOpenDiscard={() => setShowDiscard(true)}
        />
      </div>

      {/* ŽAIDĖJO KORTŲ RANKA */}
      <HandSection
        myCards={myCards_}
        onSelectCard={(card) => setMenuCard(card)}
      />
    </div>
  );
};

export default GameBoard;
