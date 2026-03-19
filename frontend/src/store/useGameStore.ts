import { create } from "zustand";
import cardsData from "../data/cards.json";

// Pagalbinė funkcija garsui paleisti
const playSound = (fileName: string) => {
  const audio = new Audio(`/sounds/${fileName}`);
  audio.volume = 0.5; // Galima reguliuoti garsumą nuo 0 iki 1
  audio.play().catch((err) => console.log("Audio play error:", err));
};

interface GameState {
  myCards: any[];
  discardPile: any[];
  drawCard: () => void;
  playCard: (cardId: string) => void;
  initGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  myCards: [],
  discardPile: [],

  drawCard: () => {
    const { myCards } = get();
    if (myCards.length >= 10) return;

    // PALEIDŽIAME GARSĄ
    playSound("draw.mp3");

    const randomIndex = Math.floor(Math.random() * cardsData.length);
    const newCard = {
      ...cardsData[randomIndex],
      id: `card-${Date.now()}-${Math.random()}`,
    };

    set({ myCards: [...myCards, newCard] });
  },

  playCard: (cardId: string) =>
    set((state) => {
      const cardToPlay = state.myCards.find((c) => c.id === cardId);
      if (!cardToPlay) return state;

      // PALEIDŽIAME GARSĄ
      playSound("play.mp3");

      return {
        myCards: state.myCards.filter((c) => c.id !== cardId),
        discardPile: [...state.discardPile, cardToPlay],
      };
    }),

  initGame: () => {
    set({ myCards: [], discardPile: [] });

    // Išdalinant 5 kortas, jos suskambės viena po kitos
    for (let i = 0; i < 5; i++) {
      setTimeout(() => get().drawCard(), i * 200);
    }
  },
}));
