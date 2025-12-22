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

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div className="h-screen flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {isFetchingNextPage && <div className="p-2 text-center">Loading more messages...</div>}
        {allMessages.map(message => (
          <div key={message._id} className="message mb-2 p-2 bg-white rounded shadow">
            <strong>{message.sender.username}:</strong> {message.content}
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-100 flex">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded">Send</button>
      </div>
    </div>
  )
}

export default ChatPage