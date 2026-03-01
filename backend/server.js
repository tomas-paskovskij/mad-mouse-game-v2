const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const cors = require("cors");

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://admin.socket.io"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
  mode: "development",
});

let rooms = [];

// PAGALBINĖ FUNKCIJA: Sutvarko žaidėjo išėjimą ir informuoja likusius
const handlePlayerExit = (socketId, roomId = null) => {
  rooms.forEach((room) => {
    // Jei roomId nurodytas, tikriname tik tą kambarį, jei ne - visus (disconnect atveju)
    if (roomId && room.id !== roomId) return;

    const playerIndex = room.players.findIndex((p) => p.id === socketId);

    if (playerIndex !== -1) {
      const leavingPlayer = room.players[playerIndex];
      room.players.splice(playerIndex, 1);

      if (room.players.length > 0) {
        // Jei išeinantis žaidėjas buvo hostas, paskiriame naują
        if (room.host === leavingPlayer.username) {
          room.host = room.players[0].username;
        }
        // !!! SVARBU: Informuojame likusius žaidėjus kambaryje, kad sąrašas pasikeitė
        io.to(room.id).emit("room_data_update", room);
      } else {
        // Jei kambaryje nieko nebeliko, ištriname kambarį
        rooms = rooms.filter((r) => r.id !== room.id);
      }
    }
  });

  // Atnaujiname Lobby sąrašą visiems
  io.emit("update_rooms", rooms);
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.emit("update_rooms", rooms);

  socket.on("create_room", (data) => {
    const newRoom = {
      id: Math.random().toString(36).substring(7),
      name: data.name,
      host: data.host,
      players: [{ id: socket.id, username: data.host, isReady: false }],
      maxPlayers: parseInt(data.maxPlayers) || 4,
      password: data.password || null,
    };

    rooms.push(newRoom);
    socket.join(newRoom.id); // Hostas automatiškai prisijungia prie socket kambario

    // Pranešame kūrėjui, kad kambarys sukurtas
    socket.emit("room_created", newRoom);
    // Atnaujiname Lobby sąrašą visiems kitiems
    io.emit("update_rooms", rooms);
  });

  function emitRoomUpdate(roomId) {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      io.to(roomId).emit("room_data_update", room);
    }
    io.emit("update_rooms", rooms);
  }

  socket.on("join_room", (data) => {
    const { roomId, username, password } = data;
    const room = rooms.find((r) => r.id === roomId);

    if (!room) return socket.emit("error_message", "Room not found!");
    if (room.password && room.password !== password) {
      return socket.emit("error_message", "Incorrect password!");
    }

    const isAlreadyIn = room.players.find((p) => p.id === socket.id);
    if (!isAlreadyIn) {
      if (room.players.length >= room.maxPlayers) {
        return socket.emit("error_message", "Room is full!");
      }
      room.players.push({ id: socket.id, username: username, isReady: false });
    } else {
      isAlreadyIn.id = socket.id;
    }

    socket.join(roomId);
    emitRoomUpdate(roomId);
    socket.emit("join_success", roomId);
  });

  socket.on("leave_room", (roomId) => {
    handlePlayerExit(socket.id, roomId);
    socket.leave(roomId);
  });

  socket.on("toggle_ready", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      emitRoomUpdate(roomId); // Naudojame bendrą funkciją atnaujinimui
    }
  });

  socket.on("update_room_settings", (data) => {
    const { roomId, newName, newMaxPlayers } = data;
    const room = rooms.find((r) => r.id === roomId);

    if (
      room &&
      room.host === room.players.find((p) => p.id === socket.id)?.username
    ) {
      room.name = newName;
      room.maxPlayers = parseInt(newMaxPlayers) || room.maxPlayers;
      emitRoomUpdate(roomId);
    }
  });

  socket.on("kick_player", (data) => {
    const { roomId, playerId } = data;
    const room = rooms.find((r) => r.id === roomId);

    if (
      room &&
      room.host === room.players.find((p) => p.id === socket.id)?.username
    ) {
      const kickedSocket = io.sockets.sockets.get(playerId);
      room.players = room.players.filter((p) => p.id !== playerId);

      if (kickedSocket) {
        kickedSocket.leave(roomId);
        kickedSocket.emit("kicked_from_room");
      }
      emitRoomUpdate(roomId);
    }
  });

  socket.on("disconnect", () => {
    handlePlayerExit(socket.id);
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3000, () => console.log("Server running on port 3000"));
