const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Tavo Vite frontend URL
    methods: ["GET", "POST"],
  },
});

// Kambarių saugykla serverio atmintyje
let rooms = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Išsiunčiam esamus kambarius naujam žaidėjui
  socket.emit("update_rooms", rooms);

  // Kambario kūrimas
  socket.on("create_room", (data) => {
    const newRoom = {
      id: Math.random().toString(36).substring(7),
      name: data.name,
      host: data.host,
      // Vietoj playerCount: 1, saugome pilną žaidėjo objektą
      players: [{ id: socket.id, username: data.host, isReady: false }],
      maxPlayers: 4,
    };
    rooms.push(newRoom);
    socket.join(newRoom.id);

    io.emit("update_rooms", rooms);
    socket.emit("join_success", newRoom.id);

    console.log("Created room", rooms);
  });

  // Žaidėjo prisijungimas prie kambario

  socket.on("join_room", (data) => {
    // Saugiklis: jei netyčia atėjo tik stringas, paverčiam objektu
    const roomId = typeof data === "string" ? data : data.roomId;
    const username = data.username || "Guest";

    console.log(`Bandoma jungtis prie: ${roomId}, Vartotojas: ${username}`);

    const room = rooms.find((r) => r.id === roomId);

    if (!room) {
      console.log("KLAIDA: Kambarys nerastas!");
      socket.emit("error_message", "Room not found");
      return;
    }

    if (room.players.length < room.maxPlayers) {
      // Tikriname, ar žaidėjas jau yra (pagal socket.id)
      const exists = room.players.find((p) => p.id === socket.id);

      if (!exists) {
        room.players.push({
          id: socket.id,
          username: username,
          isReady: false,
        });
        socket.join(roomId);
      }

      // SVARBU: Išsiunčiam visiems atnaujinimą
      io.emit("update_rooms", rooms);

      // SVARBU: Patvirtiname būtent šiam socketui, kad pavyko
      socket.emit("join_success", roomId);

      console.log("SĖKMĖ: Žaidėjas pridėtas.");
    } else {
      socket.emit("error_message", "Room is full");
    }
  });

  socket.on("leave_room", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      // Pašaliname žaidėją iš masyvo pagal jo socket.id
      room.players = room.players.filter((p) => p.id !== socket.id);

      if (room.players.length === 0) {
        rooms = rooms.filter((r) => r.id !== roomId);
      }

      io.emit("update_rooms", rooms);
      socket.leave(roomId);
    }
  });

  socket.on("toggle_ready", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        player.isReady = !player.isReady; // Pakeičiam (true -> false arba false -> true)

        // Išsiunčiam visiems atnaujintą sąrašą
        io.emit("update_rooms", rooms);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
