const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const port = parseInt(process.env.PORT || "3001", 10);
const hostname = "0.0.0.0"; // Listen on all interfaces, required for Render

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

// Optionally, root path for health check as well
app.get('/', (req, res) => {
  res.status(200).send('WebSocket Server is running');
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

// Map: userId → socketId  (in-memory, single instance)
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  // Client sends their userId immediately after connecting
  socket.on("user:register", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;
    io.emit("user:status", { userId, isOnline: true });
    console.log(`User registered: ${userId}`);
  });

  socket.on("user:check_status", (userId) => {
    if (onlineUsers.has(userId)) {
      socket.emit("user:status", { userId, isOnline: true });
    }
  });

  // Join a private room for a conversation
  // roomId = sorted([userId, friendId]).join("_")
  socket.on("room:join", (roomId) => {
    socket.join(roomId);
  });

  // Receive a message and broadcast to the room
  socket.on("message:send", ({ roomId, message }) => {
    // message shape: { id, senderId, text, createdAt }
    socket.to(roomId).emit("message:receive", message);
  });

  // Typing indicators
  socket.on("typing:start", ({ roomId, userId }) => {
    socket.to(roomId).emit("typing:start", { userId });
  });

  socket.on("typing:stop", ({ roomId, userId }) => {
    socket.to(roomId).emit("typing:stop", { userId });
  });

  socket.on("disconnect", () => {
    console.log(`[-] Socket disconnected: ${socket.id}`);
    if (socket.data.userId) {
      onlineUsers.delete(socket.data.userId);
      io.emit("user:status", { userId: socket.data.userId, isOnline: false });
      console.log(`User offline: ${socket.data.userId}`);
    }
  });
});

httpServer.listen(port, hostname, () => {
  console.log(`> Ready on http://localhost:${port}`);
});
