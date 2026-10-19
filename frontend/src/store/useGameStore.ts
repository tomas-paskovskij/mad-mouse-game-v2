import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { socket } from "../services/socket";

export interface CardType {
  instanceId: string;
  id: string;
  type:
    | "action"
    | "trap"
    | "response"
    | "curse"
    | "interrupt"
    | "goal"
    | "blessing";
  title: string;
  description: string;
  effect: string;
  art?: string;
  socialTrigger?: string;
  blessingPoints?: number;
  cursePoints?: number;
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
  blessingPoints?: number;
  cursePoints?: number;
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

export interface ActiveEffect {
  id: string;
  title: string;
  type: "CURSE" | "ACTION" | "TRAP" | "BUFF";
  description: string;
  icon: string;
  remainingTurns: number;
  maxTurns: number;
  stacks?: number;
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
  activeEffects: ActiveEffect[];
  addActiveEffect: (effect: Omit<ActiveEffect, "id">) => void;
  removeActiveEffect: (id: string) => void;
  tickTurnEffects: () => void;

  myCards: CardType[];
  myTrapZoneCards: CardType[];
  allCurses: any[];
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
  roundNumber: number;
  handLimit: number;
  phase: string;
  actionUsed: boolean;
  madMousePlayerId: string | null;

  // HOST IR PATVIRTINIMO BŪSENA
  isHost: boolean;
  pendingHostCards: Array<{
    id: string;
    playerId: string;
    playerName: string;
    card: CardType;
    timestamp: number;
  }>;
  resolveHostAction: (
    playerId: string,
    cardId: string,
    decision: "success" | "fail" | "skip",
    pendingId: string,
  ) => void;

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

  // Testavimo funkcijos
  testDrawCard: (roomId: string, type: "blessing" | "curse") => void;

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
  setActionNeedsTarget: (
    val: { card: CardType; initiatorId: string } | null,
  ) => void;
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
      activeEffects: [],

      myCards: [],
      myTrapZoneCards: [],
      allCurses: [],
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
      roundNumber: 1,
      handLimit: 100000,
      phase: "playing",
      actionUsed: false,
      madMousePlayerId: null,
      reactionWindow: null,
      notification: null,
      inspectResult: null,
      inspectStealResult: null,
      actionNeedsTarget: null,

      // Host būsena ir funkcijos
      isHost: false,
      pendingHostCards: [],

      resolveHostAction: (playerId, cardId, decision, pendingId) => {
        const roomId = get().roomId; // Paimame esamą kambario ID iš store
        socket.emit("hostResolveCard", {
          roomId,
          playerId,
          cardId,
          decision, // Siunčiame "success", "fail" arba "skip"
          pendingId,
        });
      },

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

      testDrawCard: (roomId: string, type: "blessing" | "curse") => {
        socket.emit("test_draw_card", { roomId, type });
      },

      addActiveEffect: (effect) =>
        set((state) => ({
          activeEffects: [
            { ...effect, id: `effect-${Date.now()}` },
            ...state.activeEffects,
          ],
        })),

      removeActiveEffect: (id) =>
        set((state) => ({
          activeEffects: state.activeEffects.filter((e) => e.id !== id),
        })),

      tickTurnEffects: () =>
        set((state) => ({
          activeEffects: state.activeEffects
            .map((effect) => ({
              ...effect,
              remainingTurns: effect.remainingTurns - 1,
            }))
            .filter((effect) => effect.remainingTurns > 0),
        })),

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
            console.log("📥 Klientas gavo state update:", state.activeEffects);
            console.log(
              "📥 Serverio state update - Žaidėjų taškai:",
              state.opponents?.map((p: any) => ({
                name: p.username,
                blessing: p.blessingPoints,
                curse: p.cursePoints,
              })),
            );

            const myCards = state.myCards ?? [];
            const opponents = state.opponents ?? [];
            const players = state.players ?? opponents;

            set((s) => ({
              chain: state.chain ?? s.chain,
              roundNumber: state.roundNumber ?? s.roundNumber ?? 1,
              stageActive: state.stageActive ?? s.stageActive,
              stageIdx: state.stageIdx ?? s.stageIdx,
              myCards,
              handCards: myCards,
              myTrapZoneCards: state.myTrapZoneCards ?? [],
              allCurses: state.allCurses || [],
              opponents,
              players,
              isHost: state.isHost ?? s.isHost,
              currentTurnPlayerId: state.currentTurnPlayerId ?? null,
              deckCount: state.deckCount ?? 0,
              discardPile: state.discardPile ?? [],
              tableCards: state.tableCards ?? [],
              pendingAction: state.pendingAction ?? null,
              pendingHostCards: state.pendingHostCards ?? s.pendingHostCards,
              winner: state.winner ?? null,
              turnNumber: state.turnNumber ?? 1,
              handLimit: state.handLimit ?? 100000,
              phase: state.phase ?? "playing",
              actionUsed: state.actionUsed ?? false,
              madMousePlayerId: state.madMousePlayerId ?? null,
              canDeclare: state.canDeclare ?? false,
              activeEffects: state.activeEffects ?? s.activeEffects,
              elapsedSeconds:
                typeof state.elapsedSeconds === "number"
                  ? state.elapsedSeconds
                  : s.elapsedSeconds,
            }));
          });

          // HOST PATVIRTINIMO SOCKET ĮVYKIAI
          socket.on(
            "cardPlayedPending",
            (data: {
              player: { id: string; name: string };
              card: CardType;
            }) => {
              set({ pendingHostAction: data });
            },
          );

          socket.on("cardResolved", () => {
            set({ pendingHostAction: null });
          });

          // Chain Socket įvykiai
          socket.on("card_played_display", (data: any) => {
            get().addChainEntry(data);
          });

          socket.on("turn_chain_clear", () => {
            get().clearChain();
          });

          socket.on("add_active_effect", (effectData: any) => {
            get().addActiveEffect(effectData);
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
        const { roomId, myCards } = get();

        const card = myCards.find((c) => c.instanceId === cardInstanceId);

        if (card?.requiresTarget && !targetId) {
          console.log(
            "🛑 Korta reikalauja taikinio! Atidarome pasirinkimo langą.",
          );
          set({
            actionNeedsTarget: {
              card,
              initiatorId: get().mySocketId || "",
            },
            selectedCard: null,
          });
          return;
        }

        if (roomId)
          socket.emit("play_card", {
            roomId,
            cardInstanceId,
            targetId,
            extraData,
          });
        set({ selectedCard: null, actionNeedsTarget: null });
      },

      selectTarget: (targetId, extraData) => {
        const { roomId, actionNeedsTarget } = get();
        if (roomId && actionNeedsTarget) {
          socket.emit("play_card", {
            roomId,
            cardInstanceId: actionNeedsTarget.card.instanceId,
            targetId,
            extraData,
          });
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
      setActionNeedsTarget: (val) => set({ actionNeedsTarget: val }),

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
            cardInstanceId,
            source,
          });
        }
      },

      giveCardToPlayer: (targetPlayerId, cardInstanceId) => {
        const { roomId } = get();
        if (roomId) {
          socket.emit("give_card", {
            roomId,
            targetPlayerId,
            cardInstanceId,
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
