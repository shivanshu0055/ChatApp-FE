import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { io } from 'socket.io-client'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      username: null,
      userID:null,
      token: null,
      isAuthenticated: false,
      currentList:null,
      socket: null,
      
      // Video call state
      callState: 'idle', // 'idle' | 'calling' | 'ringing' | 'in-call'
      incomingCall: null, // { from: userID, fromUsername: string, chatID: string, offer: RTCSessionDescriptionInit }
      activeCall: null, // { chatID: string, remoteUserID: string, remoteUsername: string }
      
      login: (username,userID, token) =>
        set({ username, userID, token, isAuthenticated: true ,currentList:"chatList"}),

      logout: () => {
        const { socket } = get()
        if (socket) {
          socket.disconnect()
        }
        set({ 
          username: null, 
          userID:null, 
          token: null, 
          isAuthenticated: false, 
          currentList:null, 
          socket: null,
          callState: 'idle',
          incomingCall: null,
          activeCall: null
        })
      },

      setCurrentList: (list) => set({ currentList: list }),
      
      // Call state management
      setCallState: (state) => set({ callState: state }),
      
      setIncomingCall: (callData) => set({ incomingCall: callData, callState: 'ringing' }),
      
      setActiveCall: (callData) => set({ activeCall: callData, callState: 'in-call' }),
      
      clearCall: () => set({ 
        callState: 'idle', 
        incomingCall: null, 
        activeCall: null 
      }),
      
      initSocket: () => {
        const { token, socket } = get()
        
        // If socket already exists and is connected, return it
        if (socket?.connected) {
          return socket
        }
        
        // Create new socket connection
        const newSocket = io('http://localhost:3000', {
          auth: { token }
        })
        
        newSocket.on('connected', () => {
          console.log('Socket connected globally')
        })
        
        // Listen for incoming calls
        newSocket.on('incoming-call', (data) => {
          console.log('Incoming call:', data)
          const { setIncomingCall } = get()
          setIncomingCall({
            from: data.from,
            fromUsername: data.fromUsername,
            chatID: data.chatID,
            offer: data.offer
          })
        })
        
        // Listen for call accepted
        newSocket.on('call-accepted', (data) => {
          console.log('Call accepted:', data)
          // This will be handled in VideoCall component
        })
        
        // Listen for call rejected
        newSocket.on('call-rejected', (data) => {
          console.log('Call rejected:', data)
          const { clearCall } = get()
          clearCall()
        })
        
        // Listen for call ended
        newSocket.on('call-ended', (data) => {
          console.log('Call ended:', data)
          const { clearCall } = get()
          clearCall()
        })
        
        set({ socket: newSocket })
        return newSocket
      },
      
      getSocket: () => get().socket
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        username: state.username,
        userID: state.userID,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        currentList: state.currentList,
        // Don't persist socket, call states
      })
    }
  )
)
