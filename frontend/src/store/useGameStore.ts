import { create } from "zustand";
import cardsData from "../data/cards.json";

const playSound = (fileName: string) => {
  const audio = new Audio(`/sounds/${fileName}`);
  audio.volume = 0.5;
  audio.play().catch((err) => console.log("Audio error:", err));
};

interface CardType {
  id: string;
  suit: string;
  value: string;
  [key: string]: any; // Dėl papildomų JSON duomenų
}

interface GameState {
  myCards: CardType[];
  discardPile: CardType[];
  usedCards: CardType[];
  isHistoryOpen: boolean;
  selectedHistoryCard: string | null;
  zoomedHistoryCard: string | null;
  drawCard: () => void;
  playCard: (cardId: string) => void;
  burnCard: (cardId: string) => void;
  finishTurn: () => void;
  initGame: () => void;
  setHistoryOpen: (open: boolean) => void;
  setSelectedHistoryCard: (cardId: string | null) => void;
  setZoomedHistoryCard: (cardId: string | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  myCards: [],
  discardPile: [],
  usedCards: [],
  isHistoryOpen: false,
  selectedHistoryCard: null,
  zoomedHistoryCard: null,

  drawCard: () => {
    const { myCards } = get();
    if (myCards.length >= 10) return;
    playSound("draw.mp3");
    const randomIndex = Math.floor(Math.random() * cardsData.length);
    const newCard = {
      ...cardsData[randomIndex],
      id: `card-${Date.now()}-${Math.random()}`,
    };
    set({ myCards: [...myCards, newCard] });
  },

  playCard: (cardId: string) => {
    const { myCards, discardPile } = get();
    const cardToPlay = myCards.find((c) => c.id === cardId);
    if (!cardToPlay) return;
    playSound("play.mp3");
    set({
      myCards: myCards.filter((c) => c.id !== cardId),
      discardPile: [...discardPile, cardToPlay],
    });
  },

  burnCard: (cardId: string) => {
    const { myCards } = get();
    playSound("burn.mp3");
    set({ myCards: myCards.filter((c) => c.id !== cardId) });
  },

  finishTurn: () => {
    const { discardPile, usedCards } = get();
    if (discardPile.length === 0) return;
    playSound("collect.mp3");
    set({
      usedCards: [...usedCards, ...discardPile],
      discardPile: [],
    });
  },

  setHistoryOpen: (open: boolean) =>
    set({
      isHistoryOpen: open,
      selectedHistoryCard: null,
      zoomedHistoryCard: null,
    }),
  setSelectedHistoryCard: (cardId: string | null) =>
    set({ selectedHistoryCard: cardId }),
  setZoomedHistoryCard: (cardId: string | null) =>
    set({ zoomedHistoryCard: cardId, selectedHistoryCard: null }),

  initGame: () => {
    set({
      myCards: [],
      discardPile: [],
      usedCards: [],
      isHistoryOpen: false,
      zoomedHistoryCard: null,
      selectedHistoryCard: null,
    });
    for (let i = 0; i < 5; i++) {
      setTimeout(() => get().drawCard(), i * 200);
    }
  },
}));
