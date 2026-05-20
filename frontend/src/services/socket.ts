import { io } from "socket.io-client";

const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://nkr84w11-3000.euw.devtunnels.ms";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // Polling padeda, jei websocket blokuojamas
  withCredentials: true,
  autoConnect: true,
});
