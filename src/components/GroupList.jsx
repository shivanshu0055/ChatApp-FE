import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'react-toastify'

const GroupList = () => {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["groups"],
    queryFn: () => axios.post(`http://localhost:3000/api/chat/getGroupList`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data.groupList)
  })

  const leaveGroupMutation = useMutation({
    mutationFn: (chatID) => axios.post('http://localhost:3000/api/chat/leaveGroup', { chatID }, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Left group successfully!')
    },
    onError: (error) => {
      toast.error('Error leaving group: ' + error.response?.data?.message || error.message)
    }
  })

  const handleLeave = (chatID) => {
    leaveGroupMutation.mutate(chatID)
  }

  if (isLoading) return <div>Loading groups...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div className="group-list">
      {data && data.map(group => (
        <div key={group._id} className="flex justify-between items-center p-2 border-b hover:bg-gray-100">
          <Link to={`/chat/${group._id}`} className="flex-1">
            <div className="font-semibold">
              {group.groupName}
            </div>
            <div className="text-sm text-gray-600">
              {group.lastMessage ? group.lastMessage.content : 'No messages yet'}
            </div>
          </Link>
          <button
            onClick={() => handleLeave(group._id)}
            className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={leaveGroupMutation.isPending}
          >
            {leaveGroupMutation.isPending ? 'Leaving...' : 'Leave'}
          </button>
        </div>
      ))}
    </div>
  )
}

export default GroupList