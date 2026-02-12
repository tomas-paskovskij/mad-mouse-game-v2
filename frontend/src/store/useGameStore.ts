import { create } from "zustand";

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  status: "waiting" | "playing";
}

interface GameState {
  rooms: Room[];
  currentRoomId: string | null;

  // Veiksmai
  setRooms: (rooms: Room[]) => void;
  setCurrentRoomId: (id: string | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  rooms: [],
  currentRoomId: null,

  setRooms: (rooms) => set({ rooms }),
  setCurrentRoomId: (id) => set({ currentRoomId: id }),
}));
