import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { useToast } from "../context/toast.context"
import AuctionCard from "./auctionCard.component.jsx"
import { socket } from "../lib/socket"
import { useDbUser } from "../context/user.context"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=300&fit=crop"

export default function Dashboard() {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useUser()
  const { dbUser } = useDbUser()
  const { showToast } = useToast()

  const [auctions, setAuctions] = useState([])
  const [serverOffset, setServerOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  /* =========================================================
     🔐 Auth guard
     ========================================================= */
  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      showToast("Please log in to access the dashboard", { type: "error" })
      navigate("/", { replace: true })
    }
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (!dbUser) return

    socket.connect()

    socket.emit("JOIN_DASHBOARD", {
      userId: dbUser.id,
    })

    console.log("📡 Joined dashboard socket")

    return () => {
    //   socket.disconnect()
    socket.emit("LEAVE_DASHBOAR̥D")
      console.log("🔌 Dashboard socket disconnected")
    }
  }, [dbUser])

  /* =========================================================
     🔁 Socket: dashboard bid updates
     ========================================================= */
  useEffect(() => {
    const onDashboardBidUpdate = ({ itemId, currentPrice }) => {
        console.log("Updating bid")
      setAuctions((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, currentPrice }
            : item
        )
      )
    }

    socket.on("DASHBOARD_BID_UPDATE", onDashboardBidUpdate)

    return () => {
      socket.off("DASHBOARD_BID_UPDATE", onDashboardBidUpdate)
    }
  }, [])

  /* =========================================================
     📡 Fetch auctions
     ========================================================= */
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    const fetchItems = async () => {
      try {
        const res = await fetch("http://localhost:3000/items")
        const data = await res.json()

        setServerOffset(data.serverTime - Date.now())
        setAuctions(data.items)
      } catch (err) {
        console.error("Failed to fetch items", err)
        showToast("Failed to load auctions", { type: "error" })
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [isLoaded, isSignedIn])

  if (!isLoaded || !isSignedIn || loading) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Active Auctions</h1>
          <p className="text-gray-400">
            Browse and bid on exclusive items
          </p>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((item) => (
            <AuctionCard
              key={item.id}
              id={item.id}
              imageUrl={FALLBACK_IMAGE}
              title={item.title}
              price={Number(item.currentPrice)}
              endTime={
                new Date(
                  new Date(item.auctionEndTime).getTime() - serverOffset
                )
              }
            />
          ))}
        </div>
      </main>
    </div>
  )
}
