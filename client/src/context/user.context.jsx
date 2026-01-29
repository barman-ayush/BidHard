import { createContext, useContext, useState } from "react"

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [dbUser, setDbUser] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <UserContext.Provider value={{ dbUser, setDbUser, loading, setLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useDbUser() {
  return useContext(UserContext)
}
