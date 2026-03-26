import app from "./app.js";
import cloudinary from "cloudinary";
import { Server } from "socket.io";
import http from "http";

// ---------- Cloudinary ----------
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// ---------- HTTP + Socket.IO ----------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Map userId (string) → socketId so we can emit to specific users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Client sends their userId right after connecting
  socket.on("register", (userId) => {
    if (userId) {
      onlineUsers.set(String(userId), socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    // Remove user from map on disconnect
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Helper: emit a notification event to a specific user if they're online
export const emitToUser = (userId, notification) => {
  const socketId = onlineUsers.get(String(userId));
  if (socketId) {
    io.to(socketId).emit("new_notification", notification);
  }
};

// Helper: emit to ALL connected sockets (e.g., new job posted for all seekers)
// We pass a filterFn so individual clients decide relevance
export const emitToAll = (notification) => {
  io.emit("new_notification", notification);
};

server.listen(process.env.PORT, () => {
  console.log(`Server running at port ${process.env.PORT}`);
});