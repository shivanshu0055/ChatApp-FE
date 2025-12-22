import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useActionData } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'
import { toast } from 'react-toastify'

const UserSearchBarCard = ({username,userID,sentRequests,receivedRequests,friends}) => {
  
  const loggedInUserID=useAuthStore((state)=>state.userID)
  const token=useAuthStore((state)=>state.token)

  const [alreadySent,setAlreadySent]=useState(receivedRequests.some((req)=>req.senderID==loggedInUserID))
  const [alreadyFriends,setAlreadyFriends]=useState(friends.some((friendID)=>friendID==loggedInUserID))

  const sendFriendRequest=async ()=>{
      if(alreadySent){
        toast.info("Friend request already sent")
        return
      }
      if(alreadyFriends){
        toast.info("You are already friends")
        return
      }
      const res=await axios.post("http://localhost:3000/api/friend/sendFriendRequest",{
        receiverID:userID
      },{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      setAlreadySent(true)
  }

  return (
    <div className='px-3 py-1 border-blue-300 flex justify-between bg-gray-300 rounded-3xl'>
      <div>{username}</div>
      <div onClick={sendFriendRequest} className={`cursor-pointer w-fit rounded-full ${alreadySent || alreadyFriends ? 'bg-gray-500' : 'bg-green-500'} px-3`}>
        +
      </div>
    </div>
  )
}

export default UserSearchBarCard