import { useMutation, useQuery } from '@tanstack/react-query'
// import React, { useEffect } from 'react'

import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

  const FriendCard = ({userID,username}) => {
  const token=useAuthStore(state=>state.token);
  const navigate=useNavigate()

  const {mutate,isLoading,isError,error} = useMutation({
    mutationFn: () => axios.post("http://localhost:3000/api/chat/createChat",{
          isGroupChat:false,
          userIDB:userID
        },{
          headers:{
            "Authorization":`Bearer ${token}`
          }
        }),
    onSuccess: (data) => {
      const chat = data.data.newChat || data.data.chat;
      navigate(`/chat/${chat._id}`);
    }
  });

  if(isLoading) return <p>Loading...</p>
  if(isError) return <p>Error: {error.message}</p>

  return (
    <div onClick={mutate} className='border-2 border-gray-300 bg-white text-black w-full px-3 py-2 rounded-lg my-1 cursor-pointer hover:bg-black hover:text-white text-left transition-all duration-300 ease-in-out'>
        {username}
    </div>
  )
}

export default FriendCard

