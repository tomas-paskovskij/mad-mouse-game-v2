import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { socket } from "../services/socket";

export interface CardType {
  instanceId: string;
  id: string;
  type: "action" | "trap" | "response" | "curse" | "interrupt" | "goal";
  title: string;
  description: string;
  effect: string;
  isLightning?: boolean;
  requiresTarget?: boolean;
  requiresCardSelection?: boolean;
  trigger?: string;
  duration?: number;
  count?: number;
  hidden?: boolean;
  time?: string;
  ownerUsername?: string;
}

export interface TableCard {
  id: string;
  card: CardType;
  ownerId: string;
  ownerName?: string;
  placedAt?: number;
  placedAtTurn?: number;
  turnsLeft?: number | null;
  canActivate?: boolean;
}

export interface Player {
  id: string;
  username: string;
  name?: string;
  cardCount: number;
  cards?: CardType[];
  curses?: any[];
  isConnected?: boolean;
  madMousePending?: boolean;
}

export interface OpponentInfo extends Player {}

export interface HistoryEntry {
  id: number;
  msg: string;
  type: string;
  time: string;
}

export interface ChainEntry {
  id: number;
  card: CardType;
  playerName: string;
  playerId: string;
  isTrap?: boolean;
}

interface PendingAction {
  card: CardType;
  initiatorId: string;
}

interface GameStore {
  roomId: string | null;
  mySocketId: string | null;

  // Grandinės ir stadijų būsenos
  chain: ChainEntry[];
  stageActive: boolean;
  stageIdx: number;
  stageTimer: ReturnType<typeof setTimeout> | null;

  myCards: CardType[];
  myTrapZoneCards: CardType[];
  opponents: Player[];
  players: Player[]; // Alias dėl suderinamumo su UI
  handCards: CardType[]; // Alias dėl suderinamumo su UI

  currentTurnPlayerId: string | null;
  deckCount: number;
  discardPile: CardType[];
  tableCards: TableCard[];
  pendingAction: PendingAction | null;
  winner: string | null;
  turnNumber: number;
  handLimit: number;
  phase: string;
  actionUsed: boolean;
  madMousePlayerId: string | null;

  // UI ir Istorijos būsenos
  selectedCard: CardType | null;
  showDiscard: boolean;
  showHistory: boolean;
  history: HistoryEntry[];
  reactionSecs: number;
  elapsedSeconds: number;
  canDeclare: boolean;
  trapActivating: TableCard | null;
  stealTargetPlayer: Player | null;

  reactionWindow: {
    initiatorId: string;
    card: any;
    targetId: string | null;
    durationMs: number;
    startedAt: number;
  } | null;

  notification: { message: string; type: string } | null;
  inspectResult: { targetUsername: string; cards: CardType[] } | null;
  inspectStealResult: {
    targetId: string;
    targetUsername: string;
    cards: CardType[];
  } | null;
  actionNeedsTarget: { card: CardType; initiatorId: string } | null;

  // Chain Actions
  addChainEntry: (data: {
    card: CardType;
    playerName: string;
    playerId: string;
    isTrap?: boolean;
  }) => void;
  scheduleNextChainStage: (idx: number) => void;
  stageDone: () => void;
  clearChain: () => void;

  // Game Actions
  initGame: (roomId: string) => void;
  playCard: (
    cardInstanceId: string,
    targetId?: string,
    extraData?: any,
  ) => void;
  selectTarget: (targetId: string, extraData?: any) => void;
  activateTrap: (tableCardId: string, targetId?: string) => void;
  inspectStealPick: (targetId: string, cardInstanceId: string) => void;
  drawCard: () => void;
  endTurn: () => void;
  declareMadMouse: () => void;
  mulligan: () => void;
  restartGame: () => void;
  clearInspect: () => void;
  clearInspectSteal: () => void;
  clearActionNeedsTarget: () => void;
  passReaction: () => void;
  activateTrapReaction: (tableCardId: string, targetId?: string) => void;

  // UI Actions
  setSelectedCard: (card: CardType | null) => void;
  setShowDiscard: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  toggleHistory: (show?: boolean) => void;
  addHistoryEntry: (entry: HistoryEntry) => void;
  setTrapActivating: (trap: TableCard | null) => void;
  setStealTargetPlayer: (player: Player | null) => void;
  stealCardFromPlayer: (
    targetPlayerId: string,
    cardInstanceId?: string,
    source?: "hand" | "table",
  ) => void;
  giveCardToPlayer: (targetPlayerId: string, cardInstanceId: string) => void;
}

function playSound(name: string) {
  try {
    const a = new Audio(`/sounds/${name}.mp3`);
    a.volume = 0.4;
    a.play().catch(() => {});
  } catch {}
}

let listenersAttached = false;
let timerInterval: ReturnType<typeof setInterval> | null = null;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // PRADINĖS BŪSENOS
      roomId: null,
      mySocketId: null,

      // Chain būsena
      chain: [],
      stageActive: false,
      stageIdx: 0,
      stageTimer: null,

      myCards: [],
      myTrapZoneCards: [],
      opponents: [],
      players: [],
      handCards: [],
      currentTurnPlayerId: null,
      deckCount: 0,
      discardPile: [],
      tableCards: [],
      pendingAction: null,
      winner: null,
      turnNumber: 1,
      handLimit: 100000,
      phase: "playing",
      actionUsed: false,
      madMousePlayerId: null,
      reactionWindow: null,
      notification: null,
      inspectResult: null,
      inspectStealResult: null,
      actionNeedsTarget: null,

      // UI ir Istorija
      selectedCard: null,
      showDiscard: false,
      showHistory: false,
      history: [],
      reactionSecs: 0,
      elapsedSeconds: 0,
      canDeclare: false,
      trapActivating: null,
      stealTargetPlayer: null,

      // --- CHAIN VEIKSMŲ LOGIKA ---
      addChainEntry: (data) => {
        const entry: ChainEntry = { id: Date.now(), ...data };
        const currentChain = get().chain;
        const nextChain = [...currentChain, entry];

        set({ chain: nextChain });

        if (!get().stageActive) {
          const newIdx = nextChain.length - 1;
          set({ stageActive: true, stageIdx: newIdx });
          get().scheduleNextChainStage(newIdx);
        }
      },

      scheduleNextChainStage: (idx: number) => {
        const { stageTimer } = get();
        if (stageTimer) clearTimeout(stageTimer);

        const timer = setTimeout(() => {
          const { chain } = get();
          if (idx + 1 < chain.length) {
            const nextIdx = idx + 1;
            set({ stageIdx: nextIdx });
            get().scheduleNextChainStage(nextIdx);
          } else {
            set({ stageActive: false });
          }
        }, 5000);

        set({ stageTimer: timer });
      },

      stageDone: () => {
        const { stageTimer, chain, stageIdx } = get();
        if (stageTimer) clearTimeout(stageTimer);

        const nextIdx = stageIdx + 1;
        if (nextIdx < chain.length) {
          set({ stageIdx: nextIdx });
          get().scheduleNextChainStage(nextIdx);
        } else {
          set({ stageActive: false });
        }
      },

      clearChain: () => {
        const { stageTimer } = get();
        if (stageTimer) clearTimeout(stageTimer);
        set({ chain: [], stageActive: false, stageIdx: 0, stageTimer: null });
      },

      // --- INIT GAME & SOCKETS ---
      initGame: (roomId: string) => {
        const currentSocketId = socket.id || get().mySocketId;
        set({ roomId, mySocketId: currentSocketId });

        if (!timerInterval) {
          timerInterval = setInterval(() => {
            set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
          }, 1000);
        }

        const username = (() => {
          try {
            return (
              JSON.parse(localStorage.getItem("auth-storage") || "{}").state
                ?.username || ""
            );
          } catch {
            return "";
          }
        })();

        if (!listenersAttached) {
          listenersAttached = true;

          socket.on("connect", () => {
            set({ mySocketId: socket.id });
            if (roomId) {
              socket.emit("join_game_room", { roomId, username });
            }
          });

          socket.on("game_state_update", (state: any) => {
            const myCards = state.myCards ?? [];
            const opponents = state.opponents ?? [];
            const players = state.players ?? opponents;

            set((s) => ({
              chain: state.chain ?? s.chain,
              stageActive: state.stageActive ?? s.stageActive,
              stageIdx: state.stageIdx ?? s.stageIdx,
              myCards,
              handCards: myCards,
              myTrapZoneCards: state.myTrapZoneCards ?? [],
              opponents,
              players,
              currentTurnPlayerId: state.currentTurnPlayerId ?? null,
              deckCount: state.deckCount ?? 0,
              discardPile: state.discardPile ?? [],
              tableCards: state.tableCards ?? [],
              pendingAction: state.pendingAction ?? null,
              winner: state.winner ?? null,
              turnNumber: state.turnNumber ?? 1,
              handLimit: state.handLimit ?? 100000,
              phase: state.phase ?? "playing",
              actionUsed: state.actionUsed ?? false,
              madMousePlayerId: state.madMousePlayerId ?? null,
              canDeclare: state.canDeclare ?? false,
              elapsedSeconds:
                typeof state.elapsedSeconds === "number"
                  ? state.elapsedSeconds
                  : s.elapsedSeconds,
            }));
          });

          // Chain Socket įvykiai
          socket.on("card_played_display", (data: any) => {
            get().addChainEntry(data);
          });

          socket.on("turn_chain_clear", () => {
            get().clearChain();
          });

          socket.on(
            "game_notification",
            (data: { message: string; type: string }) => {
              const time = new Date().toLocaleTimeString("lt-LT", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              set((state) => ({
                notification: data,
                history: [
                  ...state.history.slice(-49),
                  {
                    id: Date.now(),
                    msg: data.message,
                    type: data.type,
                    time,
                  },
                ],
              }));

              if (data.type === "action") playSound("play");
              if (data.type === "trap") playSound("trap");
              if (data.type === "turn") playSound("turn");
              if (data.type === "mad_mouse") playSound("win");

              setTimeout(() => set({ notification: null }), 3500);
            },
          );

          socket.on("receive_card", () => playSound("draw"));
          socket.on("starting_cards", () => playSound("draw"));

          socket.on("inspect_result", (data: any) =>
            set({ inspectResult: data }),
          );
          socket.on("inspect_steal_choose", (data: any) =>
            set({ inspectStealResult: data }),
          );
          socket.on("action_needs_target", (data: any) =>
            set({ actionNeedsTarget: data }),
          );

          socket.on("game_over", (data: { winner: string }) => {
            set({ winner: data.winner });
            playSound("win");
          });

          socket.on("game_restarted", () => {
            const currentRoomId = get().roomId;
            if (currentRoomId) window.location.href = `/room/${currentRoomId}`;
          });

          socket.on("error_message", (msg: string) => {
            alert(msg);
          });

          socket.on("reaction_window_start", (data: any) => {
            set({
              reactionWindow: { ...data, startedAt: Date.now() },
              reactionSecs: Math.ceil((data.durationMs || 3000) / 1000),
            });
          });

          socket.on("reaction_window_end", () => {
            set({ reactionWindow: null, reactionSecs: 0 });
          });
        }

        socket.emit("join_game_room", { roomId, username });
      },

      // --- GAME EMITS ---
      playCard: (cardInstanceId, targetId, extraData) => {
        const { roomId } = get();
        if (roomId)
          socket.emit("play_card", {
            roomId,
            cardInstanceId,
            targetId,
            extraData,
          });
        set({ selectedCard: null });
      },

      selectTarget: (targetId, extraData) => {
        const { roomId } = get();
        if (roomId) {
          socket.emit("select_target", { roomId, targetId, extraData });
          set({ actionNeedsTarget: null });
        }
      },

      activateTrap: (tableCardId, targetId) => {
        const { roomId } = get();
        if (roomId)
          socket.emit("activate_trap", { roomId, tableCardId, targetId });
      },

      inspectStealPick: (targetId, cardInstanceId) => {
        const { roomId } = get();
        if (roomId) {
          socket.emit("inspect_steal_pick", {
            roomId,
            targetId,
            cardInstanceId,
          });
          set({ inspectStealResult: null });
        }
      },

      drawCard: () => {
        const { roomId } = get();
        if (roomId) socket.emit("draw_card", roomId);
      },
      endTurn: () => {
        const { roomId } = get();
        if (roomId) socket.emit("end_turn", roomId);
      },
      declareMadMouse: () => {
        const { roomId } = get();
        if (roomId) socket.emit("declare_mad_mouse", roomId);
      },
      mulligan: () => {
        const { roomId } = get();
        if (roomId) socket.emit("mulligan", roomId);
      },
      restartGame: () => {
        const { roomId } = get();
        if (roomId) socket.emit("restart_game", roomId);
      },

      passReaction: () => {
        const { roomId } = get();
        if (roomId) socket.emit("pass_reaction", roomId);
        set({ reactionWindow: null });
      },
      activateTrapReaction: (tableCardId, targetId) => {
        const { roomId } = get();
        if (roomId)
          socket.emit("activate_trap_reaction", {
            roomId,
            tableCardId,
            targetId,
          });
      },
      clearInspect: () => set({ inspectResult: null }),
      clearInspectSteal: () => set({ inspectStealResult: null }),
      clearActionNeedsTarget: () => set({ actionNeedsTarget: null }),

      // UI SETTERS
      setSelectedCard: (card) => set({ selectedCard: card }),
      setShowDiscard: (show) => set({ showDiscard: show }),
      setShowHistory: (show) => set({ showHistory: show }),
      toggleHistory: (show) =>
        set((s) => ({ showHistory: show ?? !s.showHistory })),
      addHistoryEntry: (entry) =>
        set((s) => ({ history: [...s.history.slice(-49), entry] })),
      setTrapActivating: (trap) => set({ trapActivating: trap }),
      setStealTargetPlayer: (player) => set({ stealTargetPlayer: player }),
      // 1. PAIMTI / ATIMTI KORTĄ (Steal / Take)
      stealCardFromPlayer: (
        targetPlayerId,
        cardInstanceId,
        source = "hand",
      ) => {
        const { roomId } = get();
        if (roomId) {
          socket.emit("steal_card", {
            roomId,
            targetPlayerId,
            cardInstanceId, // Jei nurodoma konkreti korta (pvz. nuo stalo), arba undefined (jei atsitiktinė iš rankos)
            source, // "hand" arba "table"
          });
        }
        // set({ stealTargetPlayer: null }); // Uždaro UI modalą
      },

      // 2. DUOTI KORTĄ (Give / Transfer)
      giveCardToPlayer: (targetPlayerId, cardInstanceId) => {
        const { roomId } = get();
        if (roomId) {
          socket.emit("give_card", {
            roomId,
            targetPlayerId,
            cardInstanceId, // Korta iš mano `myCards`, kurią noriu atiduoti
          });
        }
      },
    }),
    {
      name: "game-board-storage",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        roomId: state.roomId,
        mySocketId: state.mySocketId,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
      }),
    },
  ),
);
