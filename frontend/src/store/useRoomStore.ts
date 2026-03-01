import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Player {
  id: string;
  username: string;
  isReady: boolean;
}

interface RoomState {
  roomId: string | null;
  roomName: string | null;
  hostName: string | null;
  players: Player[];
  password: string | null;
  isAdmin: boolean;
  setRoomData: (data: any, currentUser?: string | null) => void;
  clearRoom: () => void;
}

// Svarbu: TypeScript reikalauja papildomų skliaustų po create<RoomState>()
export const useRoomStore = create<RoomState>()(
  devtools(
    (set) => ({
      roomId: null,
      roomName: null,
      hostName: null,
      players: [],
      password: null,
      isAdmin: false,

      setRoomData: (data, currentUser) => {
        console.log("--- setRoomData buvo iškviestas su duomenimis:", data);
        console.trace("Kvietimo kilmė:");
        set(
          {
            roomId: data.id || data.roomId,
            roomName: data.name || data.roomName,
            hostName: data.host || data.hostName,
            players: data.players || [],
            password: data.password || null,
            isAdmin: currentUser ? data.host === currentUser : false,
          },
          false, // 'replace' parametras (false reiškia merge)
          "setRoomData", // Action pavadinimas, kurį matysi DevTools
        );
      },

      clearRoom: () =>
        set(
          {
            roomId: null,
            roomName: null,
            hostName: null,
            players: [],
            password: null,
            isAdmin: false,
          },
          false,
          "clearRoom",
        ),
    }),
    {
      name: "RoomStore", // Store pavadinimas DevTools lange
      enabled: true, // Galima palikti true arba import.meta.env.DEV
    },
  ),
);
