import { Server } from "socket.io"
import "dotenv/config"
import { registerDashboardSocket } from "./dashboard/socket.js"
import { registerItemSocket } from "./item/socket.js"

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: `${process.env.FRONTEND_URL}`,
      credentials: true,
    },
  })

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id)

    registerDashboardSocket(io , socket);

    registerItemSocket(io , socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id)
    })
  })

  return io
}
