import { create } from "zustand";

// Žaidėjo objektas (vėliau čia pridėsim taškus, spalvas ir t.t.)
interface Player {
  id: string;
  username: string;
  isReady: boolean;
}

interface RoomState {
  currentRoomId: string | null;
  roomName: string | null;
  hostName: string | null;
  players: Player[];
  isAdmin: boolean;

  // Veiksmai (Actions)
  setRoomData: (
    data: { id: string; name: string; host: string; players: Player[] },
    currentUser: string,
  ) => void;
  updatePlayers: (players: Player[]) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoomId: null,
  roomName: null,
  hostName: null,
  players: [],
  isAdmin: false,

  // Užpildome duomenis prisijungus prie kambario
  setRoomData: (data, currentUser) =>
    set({
      currentRoomId: data.id,
      roomName: data.name,
      hostName: data.host,
      players: data.players,
      isAdmin: data.host === currentUser, // Patikrinam, ar vartotojas yra šeimininkas
    }),

  // Atnaujiname tik žaidėjų sąrašą (kai kas nors prisijungia/išeina)
  updatePlayers: (players) => set({ players }),

  // Išvalome viską išeidami iš kambario
  clearRoom: () =>
    set({
      currentRoomId: null,
      roomName: null,
      hostName: null,
      players: [],
      isAdmin: false,
    }),
}));
