import { create } from "zustand";
import cardsData from "../data/cards.json";

interface GameState {
  myCards: any[];
  // Būtina pridėti playCard į interfeisą!
  playCard: (cardId: string) => void;
  drawCard: () => void;
  initGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  myCards: [],

  drawCard: () => {
    const { myCards } = get();
    if (myCards.length >= 10) return;

    const randomIndex = Math.floor(Math.random() * cardsData.length);
    const cardTemplate = cardsData[randomIndex];

    const newCard = {
      ...cardTemplate,
      // Pridedame unikalesnį ID, kad React nekiltų problemų su animacijomis
      id: `card-${Date.now()}-${Math.random()}`,
    };

    set({ myCards: [...myCards, newCard] });
  },

  playCard: (cardId: string) =>
    set((state) => ({
      myCards: state.myCards.filter((c) => c.id !== cardId),
    })),

  initGame: () => {
    // 1. Išvalome esamas kortas
    set({ myCards: [] });

    // 2. Išdaliname 5 kortas su vėlavimu
    // Naudojame paprastą ciklą su setTimeout
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        get().drawCard();
      }, i * 500);
    }
  },
}));
