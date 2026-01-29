import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { socket } from "../lib/socket"
import { useDbUser } from "../context/user.context"
import { useToast } from "../context/toast.context"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop"

export default function AuctionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dbUser } = useDbUser()
  const { showToast } = useToast()

  const [auction, setAuction] = useState(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [bidPrice, setBidPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [placingBid, setPlacingBid] = useState(false)

  // 🟢 price animation
  const [priceFlash, setPriceFlash] = useState(false)

  // 🏆 leaderboard state
  const [leaderboard, setLeaderboard] = useState([])

  /* =========================================================
     🔌 SOCKET: connect + JOIN_ITEM
     ========================================================= */
  useEffect(() => {
    if (!dbUser) return

    const onConnect = () => {
      socket.emit("JOIN_ITEM", {
        userId: dbUser.id,
        itemId: id,
      })
    }

    socket.on("connect", onConnect)

    if (!socket.connected) {
      socket.connect()
    } else {
      onConnect()
    }

    return () => {
      socket.off("connect", onConnect)
    }
  }, [dbUser, id])

  /* =========================================================
     🔁 SOCKET: item price updates + bid results
     ========================================================= */
  useEffect(() => {
    const onItemPriceUpdate = ({ itemId, currentPrice }) => {
      if (itemId !== id) return

      setAuction((prev) => ({
        ...prev,
        currentPrice,
      }))

      setBidPrice(currentPrice + 10)

      setPriceFlash(true)
      setTimeout(() => setPriceFlash(false), 500)
    }

    const onBidAccepted = () => {
      setPlacingBid(false)
      showToast("Bid placed successfully 🎉", { type: "success" })
    }

    const onBidRejected = ({ reason }) => {
      setPlacingBid(false)
      showToast(reason || "Bid rejected", { type: "error" })
    }

    const onBidError = () => {
      setPlacingBid(false)
      showToast("Something went wrong while placing bid", { type: "error" })
    }

    socket.on("ITEM_PRICE_UPDATE", onItemPriceUpdate)
    socket.on("BID_ACCEPTED", onBidAccepted)
    socket.on("BID_REJECTED", onBidRejected)
    socket.on("BID_ERROR", onBidError)

    return () => {
      socket.off("ITEM_PRICE_UPDATE", onItemPriceUpdate)
      socket.off("BID_ACCEPTED", onBidAccepted)
      socket.off("BID_REJECTED", onBidRejected)
      socket.off("BID_ERROR", onBidError)
    }
  }, [id, showToast])

  /* =========================================================
     📡 FETCH AUCTION + TIMER
     ========================================================= */
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await fetch(`http://localhost:3000/items/${id}`, {
          credentials: "include",
        })
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Auction not found")
        }

        setAuction(data.item)
        setBidPrice(Number(data.item.currentPrice) + 10)

        const serverOffset = data.serverTime - Date.now()
        const endTime = new Date(data.item.auctionEndTime).getTime()

        const tick = () => {
          const now = Date.now() + serverOffset
          const diff = endTime - now

          if (diff <= 0) {
            setTimeLeft("Auction Ended")
            return
          }

          const d = Math.floor(diff / (1000 * 60 * 60 * 24))
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
          const m = Math.floor((diff / (1000 * 60)) % 60)
          const s = Math.floor((diff / 1000) % 60)

          setTimeLeft(`${d}d ${h}h ${m}m ${s}s`)
        }

        tick()
        const timer = setInterval(tick, 1000)
        return () => clearInterval(timer)
      } catch (err) {
        console.error(err)
        navigate("/dashboard", { replace: true })
      } finally {
        setLoading(false)
      }
    }

    fetchAuction()
  }, [id, navigate])

  /* =========================================================
     🏆 FETCH LEADERBOARD (every 20 seconds)
     ========================================================= */
//   useEffect(() => {
//     if (!id) return

//     let intervalId

//     const fetchLeaderboard = async () => {
//       try {
//         const res = await fetch(
//           `http://localhost:3000/items/${id}/leaderboard`,
//           { credentials: "include" }
//         )

//         if (!res.ok) {
//           throw new Error("Failed to fetch leaderboard")
//         }

//         const data = await res.json()
//         setLeaderboard(data.leaderboard || [])
//       } catch (err) {
//         console.error("Leaderboard error:", err)
//         showToast("Failed to update leaderboard", { type: "error" })
//       }
//     }

//     // initial fetch
//     // fetchLeaderboard()

//     // poll every 20s
//     intervalId = setInterval(fetchLeaderboard, 20000)

//     return () => clearInterval(intervalId)
//   }, [id, showToast])

  /* =========================================================
     💰 PLACE BID
     ========================================================= */
  const placeBid = () => {
    if (placingBid || timeLeft === "Auction Ended") return

    setPlacingBid(true)

    socket.emit(
      "PLACE_BID",
      {
        itemId: id,
        amount: bidPrice,
      },
      (res) => {
        if (!res?.ok) {
          setPlacingBid(false)
        }
      }
    )
  }

  if (loading || !auction) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2">
            <img
              src={FALLBACK_IMAGE}
              alt={auction.title}
              className="w-full h-96 object-cover rounded-lg border border-gray-800 mb-8"
            />

            <h1 className="text-4xl font-bold mb-4">{auction.title}</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Current Bid</p>
                  <p
                    className={`text-3xl font-bold transition-all duration-300
                      ${
                        priceFlash
                          ? "text-green-400 scale-110 drop-shadow-[0_0_12px_rgba(34,197,94,0.9)]"
                          : "text-amber-400"
                      }
                    `}
                  >
                    ${Number(auction.currentPrice).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Time Left</p>
                  <p className="text-xl font-mono font-bold">{timeLeft}</p>
                </div>
              </div>
            </div>

            {/* PLACE BID */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Place Your Bid</h2>

              <div className="flex gap-4">
                <input
                  type="number"
                  value={bidPrice}
                  min={Number(auction.currentPrice) + 1}
                  onChange={(e) =>
                    setBidPrice(Number(e.target.value) || 0)
                  }
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                />

                <button
                  onClick={placeBid}
                  disabled={placingBid || timeLeft === "Auction Ended"}
                  className={`px-8 py-2 rounded-lg font-semibold transition
                    ${
                      placingBid
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-amber-400 text-black hover:bg-amber-300"
                    }
                  `}
                >
                  {placingBid ? "Placing..." : "Place Bid"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-2">Bid History</h2>
              <p className="text-gray-400 text-sm">
                Live updates appear automatically
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
