import { Link, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full h-16 bg-black border-b border-yellow-500/30 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-extrabold text-lg">B</span>
              </div>
              <span className="text-white font-semibold text-lg hidden sm:block">
                BidHub
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8 text-gray-300">
              <a href="#features" className="hover:text-yellow-400 transition">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-yellow-400 transition">
                How it works
              </a>
            </div>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-md border border-gray-700 text-gray-300 hover:border-yellow-400 hover:text-yellow-400 transition">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="px-4 py-2 rounded-md bg-yellow-400 text-black font-medium hover:bg-yellow-300 transition">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>

            {/* Mobile Toggle */}
            <button
              className="md:hidden text-gray-300 hover:text-yellow-400"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden border-t border-yellow-500/20 pt-3 pb-4 text-gray-300">
              <a href="#features" className="block py-2 hover:text-yellow-400">
                Features
              </a>
              <a href="#how-it-works" className="block py-2 hover:text-yellow-400">
                How it works
              </a>

              <div className="flex gap-2 mt-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex-1 py-2 border border-gray-700 rounded-md hover:border-yellow-400 hover:text-yellow-400">
                      Sign In
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button className="flex-1 py-2 bg-yellow-400 text-black rounded-md font-medium">
                      Get Started
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  )
}
