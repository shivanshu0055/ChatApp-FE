import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'
import { toast } from 'react-toastify'

const GroupSearchBarCard = ({ groupName, _id }) => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const [joined, setJoined] = useState(false)

  const joinGroupMutation = useMutation({
    mutationFn: () => axios.post('http://localhost:3000/api/chat/joinGroup', { chatID: _id }, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    onSuccess: () => {
      setJoined(true)
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Joined group successfully!')
    },
    onError: (error) => {
      toast.error('Error joining group: ' + error.response?.data?.message || error.message)
    }
  })

  const handleJoin = () => {
    if (!joined) {
      joinGroupMutation.mutate()
    }
  }

  return (
    <div className=' hover:bg-black hover:text-white text-left transition-all duration-200 ease-in-out max-h-80 px-3 py-1 flex justify-between bg-white border border-gray-400 rounded-xl my-2 text-black items-center font-normal'>
      <div>{groupName}</div>
      <div onClick={handleJoin} className={`text-white font-semibold cursor-pointer w-fit rounded-sm ${joined ? 'bg-gray-500' : 'bg-green-500'} px-3`}>
        {joined ? 'Joined' : 'Join'}
      </div>
    </div>
  )
}

export default GroupSearchBarCard