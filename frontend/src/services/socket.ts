import { io } from "socket.io-client";

// Jei tavo backend veikia kitu portu, pakeisk čia
const SOCKET_URL = "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Mes prisijungsime rankiniu būdu, kai turėsime vardą
});
