import { create } from "zustand";
import cardsData from "../data/cards.json";

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

      return {
        myCards: state.myCards.filter((c) => c.id !== cardId),
        discardPile: [...state.discardPile, cardToPlay],
      };
    }),

  initGame: () => {
    set({ myCards: [], discardPile: [] });
    for (let i = 0; i < 5; i++) {
      setTimeout(() => get().drawCard(), i * 200);
    }
  },
}));
