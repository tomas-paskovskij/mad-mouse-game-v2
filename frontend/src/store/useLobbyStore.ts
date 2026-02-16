import { create } from "zustand";

interface RoomSummary {
  id: string;
  name: string;
  host: string;
  playerCount: number; // Kiek žaidėjų dabar yra
  maxPlayers: number; // Maksimalus kiekis (pvz. 4)
}

interface LobbyState {
  rooms: RoomSummary[];
  setRooms: (rooms: RoomSummary[]) => void;
  updateSingleRoom: (updatedRoom: RoomSummary) => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  rooms: [],

  // Pakeičiame visą sąrašą (pvz., prisijungus)
  setRooms: (rooms) => set({ rooms }),

  // Atnaujiname tik vieno kambario informaciją (pvz., kai kažkas prisijungia prie konkretaus kambario)
  updateSingleRoom: (updatedRoom) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === updatedRoom.id ? updatedRoom : room,
      ),
    })),
}));
