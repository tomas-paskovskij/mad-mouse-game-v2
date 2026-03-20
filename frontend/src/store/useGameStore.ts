import { create } from "zustand";
import cardsData from "../data/cards.json";
import { io, Socket } from "socket.io-client";

interface CardType {
  id: string;
  suit: string;
  value: string;
  owner?: "player" | "opponent";
}

// Atnaujinta: pridėtas cardCount ir username, kad atitiktų serverio siunčiamus duomenis
interface Player {
  id: string;
  username: string;
  cardCount: number;
  isReady: boolean;
}

interface GameState {
  socket: Socket | null;
  roomId: string | null;
  opponents: Player[];
  isGameStarted: boolean;
  myCards: CardType[];
  discardPile: CardType[];
  usedCards: CardType[];
  isHistoryOpen: boolean;
  selectedHistoryCard: string | null;
  zoomedHistoryCard: string | null;

  connectToRoom: (roomId: string) => void;
  sendStartSignal: () => void;
  drawCard: (isInitial?: boolean) => void;
  playCard: (
    cardId: string,
    owner?: "player" | "opponent",
    remoteCard?: CardType,
  ) => void;
  finishTurn: () => void;
  initGame: () => void;
  setHistoryOpen: (open: boolean) => void;
  setSelectedHistoryCard: (cardId: string | null) => void;
  setZoomedHistoryCard: (cardId: string | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  roomId: null,
  opponents: [],
  isGameStarted: false,
  myCards: [],
  discardPile: [],
  usedCards: [],
  isHistoryOpen: false,
  selectedHistoryCard: null,
  zoomedHistoryCard: null,

  connectToRoom: (roomId: string) => {
    const currentSocket = get().socket;

    // 1. Sukuriame arba paimame esamą socket
    const socket = currentSocket || io("http://localhost:3000");

    // 2. Ištraukiame švarų username iš JSON struktūros
    const rawData = localStorage.getItem("auth-storage");
    let finalUsername = "Žaidėjas";

    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        // Pagal tavo nuotrauką: { "state": { "username": "www" } }
        finalUsername = parsed.state?.username || "Žaidėjas";
      } catch (e) {
        console.error("Klaida nuskaitant auth-storage:", e);
      }
    }

    // console.log("Jungiamasi kaip:", finalUsername);

    if (!currentSocket) {
      // Klausomės kambarinių duomenų atnaujinimo
      socket.on("room_data_update", (room: any) => {
        // console.log("Gauti nauji kambario duomenys:", room.players);
        // Filtruojame oponentus (kad nematytum savęs sąraše)
        // set({ opponents: room.players.filter((p: any) => p.id !== socket.id) });

        set({ opponents: room.players });
      });

      socket.on("game_init_broadcast", (data: any) => {
        set({ isGameStarted: true });
        get().initGame();
      });

      set({ socket });
    }

    // 3. Siunčiame ištrauktą vardą serveriui
    socket.emit("join_game_room", { roomId, username: finalUsername });
    set({ roomId });
  },

  sendStartSignal: () => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit("start_game", roomId);
    }
  },

  drawCard: (isInitial = false) => {
    const { myCards, socket, roomId } = get();
    if (myCards.length >= 10) return;

    const randomIndex = Math.floor(Math.random() * cardsData.length);
    const newCard = {
      ...cardsData[randomIndex],
      id: `card-${Date.now()}-${Math.random()}`,
    };

    set({ myCards: [...myCards, newCard] });

    // Jei traukiame kortą žaidimo metu (ne pradinį dalinimą), pranešame serveriui
    if (!isInitial && socket && roomId) {
      socket.emit("draw_card", roomId);
    }
  },

  playCard: (cardId, owner = "player", remoteCard) => {
    const { myCards, discardPile, socket, roomId } = get();
    let cardToPlay: CardType | undefined;

    if (owner === "player") {
      cardToPlay = myCards.find((c) => c.id === cardId);
      if (cardToPlay && socket && roomId) {
        socket.emit("play_card", { roomId, card: cardToPlay });
      }
    } else {
      cardToPlay = remoteCard;
    }

    if (!cardToPlay) return;

    set({
      myCards:
        owner === "player" ? myCards.filter((c) => c.id !== cardId) : myCards,
      discardPile: [...discardPile, { ...cardToPlay, owner }],
    });
  },

  finishTurn: () => {
    const { discardPile, usedCards } = get();
    if (discardPile.length === 0) return;
    set({
      usedCards: [...usedCards, ...discardPile],
      discardPile: [],
    });
  },

  initGame: () => {
    set({
      myCards: [],
      discardPile: [],
      usedCards: [],
      isHistoryOpen: false,
    });
    // Išdaliname po 5 kortas (perduodame true, kad nesiųstų draw_card įvykio 5 kartus)
    for (let i = 0; i < 5; i++) {
      setTimeout(() => get().drawCard(true), i * 150);
    }
  },

  setHistoryOpen: (open) => set({ isHistoryOpen: open }),
  setSelectedHistoryCard: (id) => set({ selectedHistoryCard: id }),
  setZoomedHistoryCard: (id) => set({ zoomedHistoryCard: id }),
}));
