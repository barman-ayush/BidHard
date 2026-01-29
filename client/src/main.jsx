import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { UserProvider } from './context/user.context'
import { ClerkProvider } from '@clerk/clerk-react'
import "./index.css"
import { ToastProvider } from './context/toast.context'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} >
      <BrowserRouter>
      <ToastProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </ToastProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
)
