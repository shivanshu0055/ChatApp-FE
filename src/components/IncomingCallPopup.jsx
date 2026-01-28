import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { MdCall, MdCallEnd } from 'react-icons/md'

const IncomingCallPopup = () => {
  const incomingCall = useAuthStore(state => state.incomingCall)
  const setActiveCall = useAuthStore(state => state.setActiveCall)
  const clearCall = useAuthStore(state => state.clearCall)
  const getSocket = useAuthStore(state => state.getSocket)
  const userID = useAuthStore(state => state.userID)
  
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    if (!incomingCall) {
      setTimeLeft(30)
      return
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto reject after 30 seconds
          handleReject()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [incomingCall])

  const handleAccept = async () => {
    if (!incomingCall) return

    const socket = getSocket()
    if (!socket) return

    // Set active call state with the initial offer
    setActiveCall({
      chatID: incomingCall.chatID,
      remoteUserID: incomingCall.from,
      remoteUsername: incomingCall.fromUsername,
      isInitiator: false,
      initialOffer: incomingCall.offer
    })
  }

  const handleReject = () => {
    if (!incomingCall) return

    const socket = getSocket()
    if (socket) {
      socket.emit('call-rejected', {
        to: incomingCall.from,
        from: userID
      })
    }

    clearCall()
  }

  if (!incomingCall) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-black p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-2 border-white"
        >
          {/* Caller Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black text-4xl font-bold mb-4 shadow-lg">
              {incomingCall.fromUsername?.[0]?.toUpperCase() || 'U'}
            </div>
            
            {/* Caller Name */}
            <h2 className="text-2xl font-bold text-white mb-1">
              {incomingCall.fromUsername || 'Unknown User'}
            </h2>
            
            {/* Call Status */}
            <p className="text-gray-400 text-lg mb-2">Incoming Video Call</p>
            
            {/* Timer */}
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm">
                {timeLeft}s remaining
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {/* Reject Button */}
            <button
              onClick={handleReject}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 bg-white hover:bg-gray-200 rounded-full flex items-center justify-center transition-all shadow-lg group-hover:scale-110 border-2 border-gray-800">
                <MdCallEnd className="text-black text-3xl" />
              </div>
              <span className="text-sm text-gray-400">Decline</span>
            </button>

            {/* Accept Button */}
            <button
              onClick={handleAccept}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 bg-white hover:bg-gray-200 rounded-full flex items-center justify-center transition-all shadow-lg group-hover:scale-110 animate-pulse border-2 border-gray-800">
                <MdCall className="text-black text-3xl" />
              </div>
              <span className="text-sm text-gray-400">Accept</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default IncomingCallPopup
