const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production"
const port = parseInt(process.env.PORT || "3000", 10)
const hostname = "0.0.0.0" // must be 0.0.0.0, not localhost, for Railway

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
  })

  // Map: userId → socketId  (in-memory, single instance)
  const onlineUsers = new Map()

  io.on("connection", (socket) => {
    // Client sends their userId immediately after connecting
    socket.on("user:register", (userId) => {
      onlineUsers.set(userId, socket.id)
      socket.data.userId = userId
    })

    // Join a private room for a conversation
    // roomId = sorted([userId, friendId]).join("_")
    socket.on("room:join", (roomId) => {
      socket.join(roomId)
    })

    // Receive a message and broadcast to the room
    socket.on("message:send", ({ roomId, message }) => {
      // message shape: { id, senderId, text, createdAt }
      socket.to(roomId).emit("message:receive", message)
    })

    // Typing indicators
    socket.on("typing:start", ({ roomId, userId }) => {
      socket.to(roomId).emit("typing:start", { userId })
    })
    socket.on("typing:stop", ({ roomId, userId }) => {
      socket.to(roomId).emit("typing:stop", { userId })
    })

    socket.on("disconnect", () => {
      if (socket.data.userId) {
        onlineUsers.delete(socket.data.userId)
      }
    })
  })

  // Health check for Railway
  httpServer.on("request", (req, res) => {
    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" })
      res.end("ok")
    }
  })

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
