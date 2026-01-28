import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { MdVideoCall } from 'react-icons/md'
import VideoCall from '../components/VideoCall'
import IncomingCallPopup from '../components/IncomingCallPopup'

const ChatPage = () => {
  const { chatID } = useParams()
  const { userID } = useAuthStore()
  const initSocket = useAuthStore(state => state.initSocket)
  const getSocket = useAuthStore(state => state.getSocket)
  const username = useAuthStore(state => state.username)
  const activeCall = useAuthStore(state => state.activeCall)
  const callState = useAuthStore(state => state.callState)
  const setActiveCall = useAuthStore(state => state.setActiveCall)
  const scrollRef = useRef(null)
  const [messageInput, setMessageInput] = useState('')
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const queryClient = useQueryClient()

  const token = useAuthStore(state => state.token)
  
  const { data: chatData } = useQuery({
    queryKey: ['chat', chatID],
    queryFn: () => axios.get(`http://localhost:3000/api/chat/getChat/${chatID}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data),
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
    queryKey: ['messages', chatID],
    queryFn: ({ pageParam }) => axios.get(`http://localhost:3000/api/message/getMessagesByChatID/${chatID}`, {
      params: { cursor: pageParam, limit: 20 },
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  })

  // Flatten to get oldest to newest
  const allMessages = data ? data.pages.slice().reverse().flatMap(page => page.messages) : []

  useEffect(() => {
    // Initialize or get existing socket
    const socket = initSocket()
    
    if (!socket) return

    // Join the chat room
    socket.emit('join-chat', chatID)
    console.log('Joined chat:', chatID)

    const handleMessageReceived = (messageData) => {
      console.log('New message received:', messageData)
      // Update messages cache directly
      queryClient.setQueryData(['messages', chatID], (oldData) => {
        if (!oldData) return oldData
        
        // Add new message to the last page (most recent)
        const newPages = [...oldData.pages]
        if (newPages.length > 0) {
          const lastPage = { ...newPages[newPages.length - 1] }
          lastPage.messages = [...lastPage.messages, messageData]
          newPages[newPages.length - 1] = lastPage
        }
        
        return {
          ...oldData,
          pages: newPages
        }
      })
    }

    const handleMessageDeleted = (data) => {
      console.log('Message deleted:', data)
      // Update messages cache directly
      queryClient.setQueryData(['messages', chatID], (oldData) => {
        if (!oldData) return oldData
        
        // Update the deleted message in all pages
        const newPages = oldData.pages.map(page => ({
          ...page,
          messages: page.messages.map(msg => 
            msg._id === data.messageID 
              ? { ...msg, content: 'This message is deleted' }
              : msg
          )
        }))
        
        return {
          ...oldData,
          pages: newPages
        }
      })
    }

    socket.on('message-received', handleMessageReceived)
    socket.on('message-deleted', handleMessageDeleted)

    return () => {
      // Leave chat room and remove listeners
      socket.emit('leave-chat', chatID)
      socket.off('message-received', handleMessageReceived)
      socket.off('message-deleted', handleMessageDeleted)
      console.log('Left chat:', chatID)
    }
  }, [chatID, initSocket, queryClient])

  const handleScroll = () => {
    if (scrollRef.current.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [hasNextPage, isFetchingNextPage])

  // Scroll to bottom when messages load
  useEffect(() => {
    if (scrollRef.current && allMessages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [allMessages])

  const deleteMessage = async (messageID) => {
    try {
      // Optimistic update
      queryClient.setQueryData(['messages', chatID], (oldData) => {
        if (!oldData) return oldData
        
        const newPages = oldData.pages.map(page => ({
          ...page,
          messages: page.messages.map(msg => 
            msg._id === messageID 
              ? { ...msg, content: 'This message is deleted' }
              : msg
          )
        }))
        
        return {
          ...oldData,
          pages: newPages
        }
      })

      await axios.post(`http://localhost:3000/api/message/deleteMessage/${messageID}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Emit to socket
      const socket = getSocket()
      if (socket) {
        socket.emit('delete-message', { chatID, messageID })
      }
    } catch (err) {
      console.error('Error deleting message:', err)
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['messages', chatID] })
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim()) return

    const tempMessage = {
      _id: `temp_${Date.now()}`,
      content: messageInput,
      sender: { _id: userID, username: chatData?.participants?.find(p => p._id === userID)?.username || 'You' },
      chatID,
      createdAt: new Date().toISOString()
    }

    // Optimistic update
    queryClient.setQueryData(['messages', chatID], (oldData) => {
      if (!oldData) return oldData
      
      const newPages = [...oldData.pages]
      if (newPages.length > 0) {
        const lastPage = { ...newPages[newPages.length - 1] }
        lastPage.messages = [...lastPage.messages, tempMessage]
        newPages[newPages.length - 1] = lastPage
      }
      
      return {
        ...oldData,
        pages: newPages
      }
    })

    setMessageInput('')

    try {
      // Call API to save message
      const response = await axios.post('http://localhost:3000/api/message/sendMessage', {
        chatID,
        content: tempMessage.content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Replace temp message with real message
      queryClient.setQueryData(['messages', chatID], (oldData) => {
        if (!oldData) return oldData
        
        const newPages = oldData.pages.map(page => ({
          ...page,
          messages: page.messages.map(msg => 
            msg._id === tempMessage._id 
              ? response.data.message
              : msg
          )
        }))
        
        return {
          ...oldData,
          pages: newPages
        }
      })

      // Emit to socket
      const socket = getSocket()
      if (socket) {
        socket.emit('new-message', {
          chatID,
          content: response.data.message.content,
          sender: { username: response.data.message.sender.username, _id: response.data.message.sender._id },
          _id: response.data.message._id,
          participants: chatData.participants.map(p => p._id)
        })
      }
    } catch (err) {
      console.error('Error sending message:', err)
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['messages', chatID] })
    }
  }

  const initiateCall = () => {
    if (!chatData || chatData.isGroupChat) {
      alert('Video calls are only available for direct messages')
      return
    }

    const remoteUser = chatData.participants.find(p => p._id !== userID)
    if (!remoteUser) {
      alert('Could not find the other user')
      return
    }

    setActiveCall({
      chatID,
      remoteUserID: remoteUser._id,
      remoteUsername: remoteUser.username,
      isInitiator: true
    })
  }

  if (isLoading) return (
  <div className='h-screen w-full flex items-center justify-center text-white font-Geist bg-[#0a0a0a]
[background-image:radial-gradient(circle,_rgba(255,255,255,0.15)_1.5px,_transparent_1px)]
[background-size:18px_18px]
[background-position:0_0]'>
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400">Loading messages...</p>
    </div>
  </div>
)

  if (isError) return <div>Error: {error.message}</div>

  // Show video call if in active call
  if (callState === 'in-call' && activeCall && activeCall.chatID === chatID) {
    return (
      <VideoCall
        chatID={activeCall.chatID}
        remoteUserID={activeCall.remoteUserID}
        remoteUsername={activeCall.remoteUsername}
        isInitiator={activeCall.isInitiator}
        initialOffer={activeCall.initialOffer}
      />
    )
  }

  return (
  <div className='h-screen w-full text-white font-Geist bg-[#0a0a0a]
[background-image:radial-gradient(circle,_rgba(255,255,255,0.15)_1.5px,_transparent_1px)]
[background-size:18px_18px]
[background-position:0_0] '>
    <div className="h-screen flex flex-col w-[80%] mx-auto">
      
      {/* Fixed Header */}
      <div className="p-4 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className=" w-10 h-10 bg-white text-black  rounded-full flex items-center justify-center font-bold">
            {chatData?.isGroupChat 
              ? (chatData.groupName?.[0]?.toUpperCase() || 'G')
              : (chatData?.participants?.find(p => p._id !== userID)?.username?.[0]?.toUpperCase() || 'U')
            }
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {chatData?.isGroupChat 
                ? (chatData.groupName || 'Group Chat')
                : (chatData?.participants?.find(p => p._id !== userID)?.username || 'User')
              }
            </h2>
            {chatData?.participants && (
              <p className="text-xs text-gray-400">
                {chatData.isGroupChat 
                  ? `${chatData.participants.length} participants` 
                  : 'Direct Message'
                }
              </p>
            )}
          </div>
        </div>
        
        {/* Video Call Button - Only for DMs */}
        {chatData && !chatData.isGroupChat && (
          <button
            onClick={initiateCall}
            className="cursor-pointer p-3 bg-white text-black hover:bg-gray-200 rounded-full transition-all shadow-lg hover:scale-110 border border-gray-300"
            title="Start video call"
          >
            <MdVideoCall className="text-2xl" />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {isFetchingNextPage && <div className="p-2 text-center">Loading more messages...</div>}
        {allMessages.map(message => (
          <div key={message._id} className="flex mb-2">
            {message.sender._id === userID ? (
              <div 
                className="ml-auto bg-white text-gray-700 p-3 rounded-lg max-w-xs shadow relative"
                onMouseEnter={() => setHoveredMessageId(message._id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {message.content}
                {message.content !== "This message is deleted" && hoveredMessageId === message._id && (
                  <button
                    onClick={() => deleteMessage(message._id)}
                    className="absolute -top-2 -right-2 text-red-300 hover:text-red-500 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-gray-700 text-white p-3 rounded-lg max-w-xs shadow">
                <div className="font-semibold text-sm text-gray-300 mb-1">{message.sender.username}</div>
                {message.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 flex">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 p-2 border rounded text-white"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="ml-2 p-2 bg-white text-black rounded">Send</button>
      </div>
    </div>
    
    {/* Incoming Call Popup */}
    <IncomingCallPopup />
  </div>
)
}

export default ChatPage