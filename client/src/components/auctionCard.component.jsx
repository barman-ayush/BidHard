import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function AuctionCard({ id, imageUrl, title, price, endTime }) {
  const [timeLeft, setTimeLeft] = useState("")
  const navigate = useNavigate();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now()
      const end = new Date(endTime).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft("Ended")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-amber-400 transition-colors group cursor-pointer">
      {/* Image */}
      <div className="relative h-48 bg-gray-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=300&fit=crop"
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Price */}
        <div className="mb-3 pb-3 border-b border-gray-800">
          <p className="text-gray-400 text-xs">Current Price</p>
          <p className="text-amber-400 font-bold text-xl">
            ${price.toFixed(2)}
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-gray-800 rounded p-2 text-center">
          <p className="text-gray-400 text-xs mb-1">Time Left</p>
          <p className="text-amber-400 font-mono text-sm font-bold">
            {timeLeft}
          </p>
        </div>

        {/* Bid Button */}
        <button
          className="w-full mt-3 bg-amber-400 text-black py-2 rounded hover:bg-amber-300 transition text-sm font-semibold"
          onClick={() => {
            navigate(`/auction/item/${id}`);
          }}
        >
          Start Bidding
        </button>
      </div>
    </div>
  )
}
