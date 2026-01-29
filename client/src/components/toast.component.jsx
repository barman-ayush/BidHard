export default function ToastContainer({ toasts, removeToast }) {
    return (
      <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    )
  }
  
function Toast({ toast, onClose }) {
    const colorMap = {
      success: "bg-green-600 border-green-400",
      error: "bg-red-600 border-red-400",
      info: "bg-gray-800 border-gray-600",
    }
  
    return (
      <div
        className={`min-w-65 max-w-sm px-4 py-3 rounded-lg shadow-lg text-white border-l-4
        ${colorMap[toast.type]}
        animate-slide-in`}
      >
        <div className="flex justify-between items-start gap-3">
          <p className="text-sm">{toast.message}</p>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }
  