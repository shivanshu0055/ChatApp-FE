import React, { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { MdCallEnd, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from 'react-icons/md'
import { motion } from 'framer-motion'

const VideoCall = ({ chatID, remoteUserID, remoteUsername, isInitiator, initialOffer }) => {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const [isOfferHandled, setIsOfferHandled] = useState(false)
  
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false)
  const [connectionState, setConnectionState] = useState('connecting')
  
  const getSocket = useAuthStore(state => state.getSocket)
  const clearCall = useAuthStore(state => state.clearCall)
  const userID = useAuthStore(state => state.userID)
  const callState = useAuthStore(state => state.callState)

  // Safety check - don't proceed if not in call state
  if (callState !== 'in-call') {
    console.log('VideoCall rendered but not in call state, cleaning up')
    return null
  }

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  }

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const initCall = async () => {
      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Create peer connection
        const peerConnection = new RTCPeerConnection(iceServers)
        peerConnectionRef.current = peerConnection

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream)
        })

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
          console.log('Received remote track:', event.streams[0])
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0]
          }
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('Sending ICE candidate')
            socket.emit('ice-candidate', {
              to: remoteUserID,
              candidate: event.candidate
            })
          }
        }

        // Monitor connection state
        peerConnection.onconnectionstatechange = () => {
          console.log('Connection state:', peerConnection.connectionState)
          setConnectionState(peerConnection.connectionState)
          
          if (peerConnection.connectionState === 'disconnected' || 
              peerConnection.connectionState === 'failed' ||
              peerConnection.connectionState === 'closed') {
            endCall()
          }
        }

        // If initiator, create offer
        if (isInitiator) {
          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)
          
          socket.emit('call-user', {
            to: remoteUserID,
            from: userID,
            chatID,
            offer: offer,
            fromUsername: useAuthStore.getState().username
          })
        } else if (initialOffer && !isOfferHandled) {
          // If receiver, handle the initial offer
          console.log('Receiver handling initial offer')
          await peerConnection.setRemoteDescription(new RTCSessionDescription(initialOffer))
          
          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)
          
          socket.emit('call-accepted', {
            to: remoteUserID,
            from: userID,
            answer: answer
          })
          
          setIsOfferHandled(true)
        }
      } catch (error) {
        console.error('Error initializing call:', error)
        alert('Could not access camera/microphone. Please grant permissions.')
        endCall()
      }
    }

    const handleCallAccepted = async (data) => {
      if (data.from !== remoteUserID) return
      
      console.log('Call accepted, setting remote description')
      try {
        const peerConnection = peerConnectionRef.current
        if (peerConnection && data.answer) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
        }
      } catch (error) {
        console.error('Error handling call accepted:', error)
      }
    }



    const handleIceCandidate = async (data) => {
      if (data.from !== remoteUserID) return
      
      console.log('Received ICE candidate')
      try {
        const peerConnection = peerConnectionRef.current
        if (peerConnection && data.candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error)
      }
    }

    const handleCallEnded = (data) => {
      if (data.from === remoteUserID) {
        console.log('Remote user ended call')
        endCall()
      }
    }

    const handleVideoToggled = (data) => {
      if (data.from === remoteUserID) {
        console.log('Remote video toggled:', data.isVideoOff)
        setIsRemoteVideoOff(data.isVideoOff)
      }
    }

    // Set up socket listeners
    socket.on('call-accepted', handleCallAccepted)
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('call-ended', handleCallEnded)
    socket.on('video-toggled', handleVideoToggled)

    // Initialize the call
    initCall()

    return () => {
      socket.off('call-accepted', handleCallAccepted)
      socket.off('ice-candidate', handleIceCandidate)
      socket.off('call-ended', handleCallEnded)
      socket.off('video-toggled', handleVideoToggled)
      
      // Cleanup on unmount
      console.log('VideoCall component unmounting - cleaning up media')
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop()
          console.log('Cleanup: Stopped track:', track.kind)
        })
        localStreamRef.current = null
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }
    }
  }, [chatID, remoteUserID, isInitiator])

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
        
        // Notify remote user about video state change
        const socket = getSocket()
        if (socket) {
          socket.emit('video-toggled', {
            to: remoteUserID,
            isVideoOff: !videoTrack.enabled
          })
        }
      }
    }
  }

  const endCall = () => {
    const socket = getSocket()
    
    // Stop all local tracks first
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('Stopped track:', track.kind)
      })
      localStreamRef.current = null
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Notify remote user
    if (socket && remoteUserID) {
      socket.emit('end-call', { to: remoteUserID })
    }

    // Clear call state
    clearCall()
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Remote Video (full screen) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1 relative"
      >
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Remote Video Off Placeholder */}
        {isRemoteVideoOff && connectionState === 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-black text-6xl font-bold mb-4 mx-auto">
                {remoteUsername?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-white text-xl font-semibold">{remoteUsername}</div>
              <div className="text-gray-400 mt-2">📹 Camera is off</div>
            </div>
          </div>
        )}
        
        {connectionState !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="text-2xl mb-2">
                {connectionState === 'connecting' ? '📞 Connecting...' : '⚠️ Connection Issues'}
              </div>
              <div className="text-gray-300">{remoteUsername}</div>
            </div>
          </div>
        )}

        {/* Local Video (Picture in Picture) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, x: 100, y: -50 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, type: 'spring', stiffness: 100 }}
          className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg"
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        </motion.div>

        {/* Call Info */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg"
        >
          <div className="text-white font-semibold">{remoteUsername}</div>
          <div className="text-gray-300 text-sm">
            {connectionState === 'connected' ? '🟢 Connected' : '🟡 Connecting...'}
          </div>
        </motion.div>
      </motion.div>

      {/* Controls */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, type: 'spring', stiffness: 100 }}
        className="bg-black p-6 flex justify-center items-center gap-4 border-t border-gray-800"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMute}
          className={`cursor-pointer p-4 rounded-full ${isMuted ? 'bg-white text-black' : 'bg-gray-800 text-white'} hover:opacity-80 transition-all border border-gray-700 cursor-pointer`}
        >
          {isMuted ? <MdMicOff className="text-2xl" /> : <MdMic className="text-2xl" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleVideo}
          className={`cursor-pointer p-4 rounded-full ${isVideoOff ? 'bg-white text-black' : 'bg-gray-800 text-white'} hover:opacity-80 transition-all border border-gray-700 cursor-pointer`}
        >
          {isVideoOff ? <MdVideocamOff className="text-2xl" /> : <MdVideocam className="text-2xl" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={endCall}
          className="cursor-pointer p-4 rounded-full bg-white text-black hover:bg-gray-200 transition-all border border-gray-700 cursor-pointer"
        >
          <MdCallEnd className="text-2xl" />
        </motion.button>
      </motion.div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </motion.div>
  )
}

export default VideoCall
