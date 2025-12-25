import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { io } from 'socket.io-client'

const ChatPage = () => {
  const { chatID } = useParams()
  const { token, userID } = useAuthStore()
  const scrollRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const queryClient = useQueryClient()

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
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    })

    setSocket(newSocket)

    newSocket.on('connected', () => {
      console.log('Connected to socket')
      newSocket.emit('join-chat', chatID)
    })

    newSocket.on('message-received', (messageData) => {
      console.log('New message received:', messageData)
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages', chatID] })
    })

    newSocket.on('message-deleted', (data) => {
      console.log('Message deleted:', data)
      queryClient.invalidateQueries({ queryKey: ['messages', chatID] })
    })

    return () => {
      newSocket.disconnect()
    }
  }, [chatID, token, queryClient])

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
      await axios.post(`http://localhost:3000/api/message/deleteMessage/${messageID}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Emit to socket
      socket.emit('delete-message', { chatID, messageID })

      // Refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages', chatID] })
    } catch (err) {
      console.error('Error deleting message:', err)
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim()) return

    try {
      // Call API to save message
      const response = await axios.post('http://localhost:3000/api/message/sendMessage', {
        chatID,
        content: messageInput
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Emit to socket
      socket.emit('new-message', {
        chatID,
        content: messageInput,
        sender: { username: response.data.message.sender.username },
        _id: response.data.message._id,
        participants: chatData.participants.map(p => p._id)
      })

      setMessageInput('')
      // Refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages', chatID] })
    } catch (err) {
      console.error('Error sending message:', err)
    }
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

  return (
  <div className='h-screen w-full text-white font-Geist bg-[#0a0a0a]
[background-image:radial-gradient(circle,_rgba(255,255,255,0.15)_1.5px,_transparent_1px)]
[background-size:18px_18px]
[background-position:0_0] '>
    <div className="h-screen flex flex-col w-[80%] mx-auto">
      
      {/* Fixed Header */}
      <div className=" p-4 flex items-center gap-3 ">
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
  </div>
)
}

export default ChatPage