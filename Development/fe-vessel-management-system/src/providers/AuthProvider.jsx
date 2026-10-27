import { useMemo } from 'react'
import { roles } from '../data/mockUsers'
import { AuthContext } from '../hooks/authContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { api } from '../services/mockApi'

const STORAGE_KEY = 'rkbm_session'

export function AuthProvider({ children }) {
  const [session, setSession] = useLocalStorage(STORAGE_KEY, null)

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      login: (userId) => {
        const users = api.users.list().filter((item) => item.status !== 'Nonaktif')
        const user = users.find((item) => item.id === userId) ?? users[0]
        setSession({ user, loggedInAt: new Date().toISOString() })
      },
      logout: () => setSession(null),
      roles,
    }),
    [session, setSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
