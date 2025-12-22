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
    <div className='px-3 py-1 border-blue-300 flex justify-between bg-gray-300 rounded-3xl'>
      <div>{groupName}</div>
      <div onClick={handleJoin} className={`cursor-pointer w-fit rounded-full ${joined ? 'bg-gray-500' : 'bg-green-500'} px-3`}>
        {joined ? 'Joined' : 'Join'}
      </div>
    </div>
  )
}

export default GroupSearchBarCard