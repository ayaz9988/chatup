import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

//@ts-expect-error ts-migrate(7006) FIXME: Parameter 'userId' implicitly has an 'any' type.
export function getReceiverSocketId(userId) {
  //@ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  //@ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    //@ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
