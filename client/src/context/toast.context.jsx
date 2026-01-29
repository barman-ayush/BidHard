import { createContext, useContext, useState, useCallback } from "react"
import ToastContainer from "../components/toast.component"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, options = {}) => {
    const id = crypto.randomUUID()

    const toast = {
      id,
      message,
      type: options.type || "info", // success | error | info
      duration: options.duration || 3000,
    }

    setToasts((prev) => [...prev, toast])

    // Auto remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration)
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider")
  }
  return ctx
}
