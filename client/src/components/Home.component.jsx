import { useUser } from '@clerk/clerk-react'
import { Shield, Zap, CheckCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useDbUser } from '../context/user.context'
import { useToast } from '../context/toast.context'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser()
  const { dbUser, setDbUser, loading, setLoading } = useDbUser();
  const { showToast } = useToast()
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || dbUser) return
  
    const registerUser = async () => {
      try {
        setLoading(true)
  
        const res = await fetch("http://localhost:3000/auth/register", {
          method: "GET",
          credentials: "include",
        })
  
        const data = await res.json()
  
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Registration failed")
        }
  
        setDbUser(data.user)
  
        // ✅ SUCCESS TOAST
        showToast("Welcome! You are logged in successfully 🎉", {
          type: "success",
        })
      } catch (err) {
        console.error("Register error:", err)
  
        // ❌ ERROR TOAST
        showToast(
          err.message || "Something went wrong while logging in",
          { type: "error" }
        )
      } finally {
        setLoading(false)
      }
    }
  
    registerUser()
  }, [isLoaded, isSignedIn])
  

  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <section className="pt-32 pb-20 px-4 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Fair & Transparent
          <span className="block text-amber-400">Bidding Platform</span>
        </h1>

        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
          Real-time auctions built for trust, speed, and absolute clarity.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => {navigate("/auction/dashboard")}}  className="px-8 py-3 hover:cursor-pointer rounded-md bg-amber-400 text-black font-semibold hover:bg-amber-300 transition">
            Start Bidding
          </button>
          {/* <button className="px-8 py-3 rounded-md border border-gray-700 text-gray-300 hover:border-amber-400 hover:text-amber-400 transition">
            Browse Auctions
          </button> */}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-slate-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-14">
            Why Choose Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-800 rounded-lg hover:border-amber-400 transition">
              <Shield className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure</h3>
              <p className="text-sm text-gray-400">
                Verified users and encrypted transactions for total peace of mind.
              </p>
            </div>

            <div className="p-6 border border-gray-800 rounded-lg hover:border-amber-400 transition">
              <Zap className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fast</h3>
              <p className="text-sm text-gray-400">
                Real-time bids, instant updates, zero lag.
              </p>
            </div>

            <div className="p-6 border border-gray-800 rounded-lg hover:border-amber-400 transition">
              <CheckCircle className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Transparent</h3>
              <p className="text-sm text-gray-400">
                No hidden fees. What you bid is what you pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-10 text-center text-sm text-gray-400">
        <p>© 2025 BidHub. All rights reserved.</p>
      </footer>
    </main>
  )
}
