import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useGameStore } from "../../store/useGameStore";
import { useGameChain } from "../../hooks/useGameChain";
import { useGameHistory } from "../../hooks/useGameHistory";

// Pagrindinės sekcijos
import { TopBar } from "./TopBar";
import { PlayersSection } from "./PlayersSection";
import { ChainSection } from "./ChainSection";
import { TrapsSection } from "./TrapsSection";
import { PilesSection } from "./PilesSection";
import { HandSection } from "./HandSection";
import { HistoryPanel } from "./HistoryPanel";
import { ReactionWindow } from "./ReactionWindow";

// Modalai
import { PlayModal } from "./modals/PlayModal";
import { CardMenu } from "./modals/CardMenu";
import { TrapMenu } from "./modals/TrapMenu";
import { DiscardModal } from "./modals/DiscardModal";
import { WinnerModal } from "./modals/WinnerModal";
import { PlayerStealModal } from "./modals/PlayerStealModal";
import { NotificationBanner } from "./modals/NotificationBanner";
import { ZoomOverlay } from "./modals/ZoomOverlay";
import { TargetSelectionModal } from "./modals/TargetSelectionModal";
import { InspectModal } from "./modals/InspectModal";
import { InspectStealModal } from "./modals/InspectStealModal";

import "./GameBoard.css";

export const GameBoard: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // Pagrindinės būsenos iš Zustand store
  const initGame = useGameStore((s) => s.initGame);
  const winner = useGameStore((s) => s.winner);
  const restartGame = useGameStore((s) => s.restartGame);
  const isMyTurn = useGameStore((s) => s.currentTurnPlayerId === s.mySocketId);
  const iMadMouse = useGameStore((s) => s.madMousePlayerId === s.mySocketId);

  // Hook'ai grandinei ir istorijos klausymui
  const { chain, stageActive, stageIdx, stageDone } = useGameChain();
  const { flash } = useGameHistory();

  useEffect(() => {
    if (roomId) {
      initGame(roomId);
    }
  }, [roomId, initGame]);

  // Jei žaidimas baigtas ir yra laimėtojas
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
      {/* 1. NOTIFIKACIJOS IR INTERAKTYVŪS MODALAI */}
      <NotificationBanner />

      <AnimatePresence>
        <CardMenu key="card-menu" />
        <TrapMenu key="trap-menu" />
        <ZoomOverlay key="zoom-overlay" />
        <TargetSelectionModal key="target-selection-modal" />
        <InspectModal key="inspect-modal" />
        <InspectStealModal key="inspect-steal-modal" />
        <PlayerStealModal key="player-steal-modal" />
        <DiscardModal key="discard-modal" />
        <HistoryPanel key="history-panel" />
        <ReactionWindow key="reaction-window" />

        {stageActive && chain[stageIdx] && (
          <PlayModal
            key="play-modal"
            entry={chain[stageIdx]}
            chain={chain}
            onSkip={stageDone}
          />
        )}
      </AnimatePresence>

      {/* 2. VIRŠUTINĖ INFO JUOSTA */}
      <TopBar />

      {/* 3. PAGRINDINIS ŽAIDIMO LAUKAS (STALAS) */}
      <div className="main-content-side-section">
        <div className="main-content-section flex-1">
          <PlayersSection />
          <ChainSection />
          <TrapsSection />

          {/* Centrinis emoji flash efektas gaunant pranešimą */}
          <AnimatePresence>
            {flash && (
              <motion.div
                className="flash-center"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "4rem",
                  zIndex: 1400,
                  pointerEvents: "none",
                  filter: "drop-shadow(0 0 15px rgba(255,255,255,0.6))",
                }}
              >
                {flash}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mad Mouse statuso pranešimas */}
          {iMadMouse && (
            <div className="mm-banner">
              🐭 MAD MOUSE paskelbtas! Laukiame rato pabaigos...
            </div>
          )}
        </div>

        {/* Kaladės (Piles) sekcija */}
        <PilesSection />
      </div>

      {/* 4. ŽAIDĖJO KORTŲ RANKA */}
      <HandSection />
    </div>
  );
};

export default GameBoard;
