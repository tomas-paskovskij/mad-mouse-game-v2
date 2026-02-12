const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite numatytasis port'as
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Vartotojas prisijungė:", socket.id);

  socket.on("disconnect", () => {
    console.log("Vartotojas atsijungė:", socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Serveris veikia port'u ${PORT}`);
});
