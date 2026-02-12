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
      playerCount: 1,
      maxPlayers: 4,
      status: "waiting",
    };

    rooms.push(newRoom);

    // Siunčiam atnaujintą sąrašą VISIEMS
    io.emit("update_rooms", rooms);
    console.log("New room created:", newRoom.name);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
