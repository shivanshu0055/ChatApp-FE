import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const ChatList = () => {
  const { token } = useAuthStore()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["chatList"],
    queryFn: () => axios.post(`http://localhost:3000/api/chat/getChatList`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data.chatList)
  })

  if (isLoading) return <div>Loading chats...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div className="chat-list">
      {data && data.map(chat => (
        <Link key={chat._id} to={`/chat/${chat._id}`} className="block p-2 border-b hover:bg-gray-100">
          <div className="font-semibold">
            {chat.isGroupChat ? chat.groupName : chat.participants.filter(p => p._id !== useAuthStore.getState().userID).map(p => p.username).join(', ')}
          </div>
          <div className="text-sm text-gray-600">
            {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ChatList