import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { HashLoader } from 'react-spinners'

const ChatList = () => {
  const { token } = useAuthStore()
  const navigate=useNavigate()
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["chatList"],
    queryFn: () => axios.post(`http://localhost:3000/api/chat/getChatList`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data.chatList)
  })

  if(isLoading) return (
    <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center ">
        <HashLoader size={20} color="#000000" />
    </div>
  )

    if(isError) return <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center text-center text-black">
        {error.message}
    </div>
  return (
    <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2">
      {data.length==0 ? 
        (
            <p className='text-black/60 text-center font-medium'>No chats available</p>
        ): 
      data.map(chat => (
        <div key={chat._id} onClick={()=>{
          navigate(`/chat/${chat._id}`)
        }} className="border-2 border-gray-300 bg-white text-black w-full px-3 py-1 rounded-lg my-1 cursor-pointer hover:bg-black hover:text-white text-left transition-all duration-300 ease-in-out">
          <div className="font-semibold ">
            {chat.isGroupChat ? chat.groupName : chat.participants.filter(p => p._id !== useAuthStore.getState().userID).map(p => p.username).join(', ')}
          </div>
          <div className="text-sm text-gray-500">
            {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatList