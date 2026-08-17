import { io } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";

const getSocketUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://5b1spzmn-3000.euw.devtunnels.ms";
  }
  return "http://localhost:3000";
};

export const socket = io(getSocketUrl(), {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  auth: (cb) => {
    const username = useAuthStore.getState().username;
    cb({ username: username || "guest" });
  },
});

// Kai socket prisijungia (pvz., po F5 perkrovimo)
socket.on("connect", () => {
  const { username, activeGameId } = useAuthStore.getState();

  // Jei turime ir vartotoją, ir aktyvų žaidimo ID – pranešame serveriui, kad grįžtame
  if (username && activeGameId) {
    console.log(`Bandoma grįžti į žaidimą: ${activeGameId}`);
    socket.emit("rejoin_game", { roomId: activeGameId, username });
  }
});
