import axios from "axios"
import "dotenv/config"

export function registerItemSocket(io, socket) {

  socket.on("JOIN_ITEM", ({ userId, itemId }) => {
    if (socket.data.joinedRoom) return;

    socket.data.joinedRoom = true;
    const roomName = `item:${itemId}`
    socket.join(roomName);
    console.log(`🎯 User ${userId} joined ITEM room: ${roomName}`)
  })

  socket.on("PLACE_BID", async ({ itemId, amount }, ack) => {
    try {
      const roomName = `item:${itemId}`

      const response = await axios.post(
        `${process.env.DOMAIN}/items/${itemId}/bid`,
        { amount },
        {
          withCredentials: true,
          headers: {
            cookie: socket.handshake.headers.cookie,
          },
        }
      )

      // Backend is source of truth
      const payload = {
        itemId,
        currentPrice: response.data.amount,
        serverTime: response.data.serverTime,
      }

      io.to(roomName).emit("ITEM_PRICE_UPDATE", payload)

      io.to("dashboard").emit("DASHBOARD_BID_UPDATE", payload)

      socket.emit("BID_ACCEPTED", payload)

      ack?.({ ok: true })

    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message || "Bid failed"

      if ([400, 404, 409].includes(status)) {
        socket.emit("BID_REJECTED", {
          itemId,
          reason: message,
        })
        ack?.({ ok: false, reason: message })
        return
      }

      console.error("PLACE_BID error:", err.message)

      socket.emit("BID_ERROR", {
        message: "Internal error while placing bid",
      })

      ack?.({ ok: false })
    }
  })
}
