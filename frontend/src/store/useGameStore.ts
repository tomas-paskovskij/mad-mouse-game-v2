import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { socket } from "../services/socket";

export interface CardType {
  instanceId: string;
  id: string;
  type: "action" | "trap" | "response" | "curse";
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
}

export interface TableCard {
  id: string;
  card: CardType;
  ownerId: string;
  ownerName: string;
  placedAt: number;
  turnsLeft: number | null;
  canActivate?: boolean;
}

export interface OpponentInfo {
  id: string;
  username: string;
  cardCount: number;
  curses: any[];
  isConnected: boolean;
  madMousePending: boolean;
}

interface PendingAction {
  card: CardType;
  initiatorId: string;
}

interface GameStore {
  roomId: string | null;
  mySocketId: string | null;

  myCards: CardType[];
  myTrapZoneCards: CardType[];
  opponents: OpponentInfo[];
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
}

function playSound(name: string) {
  try {
    const a = new Audio(`/sounds/${name}.mp3`);
    a.volume = 0.4;
    a.play().catch(() => {});
  } catch {}
}

let listenersAttached = false;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      roomId: null,
      mySocketId: null,
      myCards: [],
      myTrapZoneCards: [],
      opponents: [],
      currentTurnPlayerId: null,
      deckCount: 0,
      discardPile: [],
      tableCards: [],
      pendingAction: null,
      winner: null,
      turnNumber: 0,
      handLimit: 100000,
      phase: "playing",
      actionUsed: false,
      madMousePlayerId: null,
      reactionWindow: null,
      notification: null,
      inspectResult: null,
      inspectStealResult: null,
      actionNeedsTarget: null,

      initGame: (roomId: string) => {
        const currentSocketId = socket.id || get().mySocketId;
        set({ roomId, mySocketId: currentSocketId });

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

        // Prijungiame Socket.io klausytojus vieną kartą
        if (!listenersAttached) {
          listenersAttached = true;

          socket.on("connect", () => {
            set({ mySocketId: socket.id });
            if (roomId) {
              socket.emit("join_game_room", { roomId, username });
            }
          });

          socket.on("game_state_update", (state: any) => {
            set({
              myCards: state.myCards || [],
              myTrapZoneCards: state.myTrapZoneCards || [],
              opponents: state.opponents || [],
              currentTurnPlayerId: state.currentTurnPlayerId,
              deckCount: state.deckCount,
              discardPile: state.discardPile || [],
              tableCards: state.tableCards || [],
              pendingAction: state.pendingAction,
              winner: state.winner,
              turnNumber: state.turnNumber || 0,
              handLimit: state.handLimit || 100000,
              phase: state.phase || "playing",
              actionUsed: state.actionUsed || false,
              madMousePlayerId: state.madMousePlayerId || null,
            });
          });

          socket.on(
            "game_notification",
            (data: { message: string; type: string }) => {
              set({ notification: data });
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
            set({ reactionWindow: { ...data, startedAt: Date.now() } });
          });

          socket.on("reaction_window_end", () => {
            set({ reactionWindow: null });
          });
        }

        // Išsiunčiame prisijungimą/rejoin į kambarį
        socket.emit("join_game_room", { roomId, username });
      },

      playCard: (cardInstanceId, targetId, extraData) => {
        const { roomId } = get();
        if (roomId)
          socket.emit("play_card", {
            roomId,
            cardInstanceId,
            targetId,
            extraData,
          });
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
    }),
    {
      name: "game-board-storage", // Būsenos raktas naršyklėje
      storage: createJSONStorage(() => sessionStorage), // Naudojama sessionStorage, kad uždarius kortelę būsena nusinulintų, bet perėjus puslapius išliktų
      partialize: (state) => ({
        roomId: state.roomId,
        mySocketId: state.mySocketId,
      }),
    },
  ),
);
