import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      username: null,
      userID:null,
      token: null,
      isAuthenticated: false,
      currentList:null,
      login: (username,userID, token) =>
        set({ username, userID, token, isAuthenticated: true ,currentList:"chatList"}),

      logout: () =>
        set({ username: null, userID:null, token: null, isAuthenticated: false , currentList:null}),

      setCurrentList: (list) => set({ currentList: list })
    }),
    {
      name: 'auth-storage',
    }
  )
)
