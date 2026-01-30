import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { socket } from "../lib/socket"
import { useDbUser } from "../context/user.context"
import { useToast } from "../context/toast.context"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  

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
  const [priceFlash, setPriceFlash] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    if (!dbUser) return

    const onConnect = () => {
      socket.emit("JOIN_ITEM", { userId: dbUser.id, itemId: id })
    }

    socket.on("connect", onConnect)

    if (!socket.connected) socket.connect()
    else onConnect()

    return () => socket.off("connect", onConnect)
  }, [dbUser, id])

  useEffect(() => {
    const onItemPriceUpdate = ({ itemId, currentPrice }) => {
      if (itemId !== id) return

      setAuction((prev) => ({ ...prev, currentPrice }))
      setBidPrice(currentPrice + 10)

      setPriceFlash(true)
      setTimeout(() => setPriceFlash(false), 500)
    }

    const onBidAccepted = () => {
      setPlacingBid(false)
      showToast("Bid placed successfully", { type: "success" })
    }

    const onBidRejected = ({ reason }) => {
      setPlacingBid(false)
      showToast(reason || "Bid rejected", { type: "error" })
    }

    const onBidError = () => {
      setPlacingBid(false)
      showToast("Failed to place bid", { type: "error" })
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

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/items/${id}`, {
          credentials: "include",
        })
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error("Auction not found")
        }

        setAuction(data.item)
        setBidPrice(Number(data.item.currentPrice) + 10)

        const offset = data.serverTime - Date.now()
        const endTime = new Date(data.item.auctionEndTime).getTime()

        const tick = () => {
          const diff = endTime - (Date.now() + offset)
          if (diff <= 0) return setTimeLeft("Auction Ended")

          const d = Math.floor(diff / 86400000)
          const h = Math.floor((diff / 3600000) % 24)
          const m = Math.floor((diff / 60000) % 60)
          const s = Math.floor((diff / 1000) % 60)

          setTimeLeft(`${d}d ${h}h ${m}m ${s}s`)
        }

        tick()
        const timer = setInterval(tick, 1000)
        return () => clearInterval(timer)
      } catch {
        navigate("/dashboard", { replace: true })
      } finally {
        setLoading(false)
      }
    }

    fetchAuction()
  }, [id, navigate])

  useEffect(() => {
    if (!id) return

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/items/${id}/leaderboard`,
          { credentials: "include" }
        )

        if (!res.ok) throw new Error()

        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
      } catch {
        showToast("Failed to update leaderboard", { type: "error" })
      }
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 20000)
    return () => clearInterval(interval)
  }, [id, showToast])

  const placeBid = () => {
    if (placingBid || timeLeft === "Auction Ended") return

    setPlacingBid(true)
    socket.emit("PLACE_BID", { itemId: id, amount: bidPrice }, (res) => {
      if (!res?.ok) setPlacingBid(false)
    })
  }

  if (loading || !auction) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <img
              src={FALLBACK_IMAGE}
              alt={auction.title}
              className="w-full h-96 object-cover rounded-lg border border-gray-800 mb-8"
            />

            <h1 className="text-4xl font-bold mb-4">{auction.title}</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
              <p className="text-gray-400 text-sm">Current Bid</p>
              <p
                className={`text-3xl font-bold transition-all ${
                  priceFlash ? "text-green-400 scale-110" : "text-amber-400"
                }`}
              >
                ${Number(auction.currentPrice).toFixed(2)}
              </p>
              <p className="mt-2 font-mono">{timeLeft}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex gap-4">
                <input
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  className="flex-1 px-4 py-2 bg-gray-800 rounded-lg"
                />
                <button
                  onClick={placeBid}
                  disabled={placingBid}
                  className="px-8 py-2 bg-amber-400 text-black rounded-lg"
                >
                  {placingBid ? "Placing..." : "Place Bid"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Leaderboard</h2>

              {leaderboard.length === 0 ? (
                <p className="text-gray-400 text-sm">No bids yet</p>
              ) : (
                <ul className="space-y-3">
                  {leaderboard.map((entry) => (
                    <li
                      key={entry.userId}
                      className="flex items-center justify-between"
                    >
                      <span>
                        #{entry.rank} {entry.name}
                      </span>
                      <span className="font-bold text-amber-400">
                        ${entry.highestBid}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
