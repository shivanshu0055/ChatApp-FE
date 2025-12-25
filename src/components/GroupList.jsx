import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'react-toastify'
import { HashLoader } from 'react-spinners'

const GroupList = () => {
  const { token, userID } = useAuthStore()
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

  const deleteGroupMutation = useMutation({
    mutationFn: (chatID) => axios.post(`http://localhost:3000/api/chat/deleteChat/${chatID}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Group deleted successfully!')
    },
    onError: (error) => {
      toast.error('Error deleting group: ' + error.response?.data?.message || error.message)
    }
  })

  if(isLoading) return 
    <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center ">
        <HashLoader size={20}/>
    </div>

    if(isError) return <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center text-center text-black">
        {error.message}
    </div>
  return (
    <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2">
      {data.length==0? 
      (
        <p className='text-black/60 text-center font-medium'>No groups found</p>
      )
      :data.map(group => (
        <div key={group._id} className="flex items-center border-2 border-gray-300 bg-white text-black w-full px-3 py-1 rounded-lg my-1 cursor-pointer hover:bg-black hover:text-white text-left transition-all duration-300 ease-in-out">
          <Link to={`/chat/${group._id}`} className="flex-1">
            <div className="font-semibold">
              {group.groupName}
            </div>
            <div className="text-sm text-gray-600">
              {group.lastMessage ? group.lastMessage.content : 'No messages yet'}
            </div>
          </Link>
          <button
            onClick={() => userID === group.admin._id.toString() ? deleteGroupMutation.mutate(group._id) : leaveGroupMutation.mutate(group._id)}
            className="font-semibold cursor-pointer ml-2 px-3 py-0.5 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={userID === group.admin._id.toString() ? deleteGroupMutation.isPending : leaveGroupMutation.isPending}
          >
            {userID === group.admin._id.toString() 
              ? (deleteGroupMutation.isPending ? 'Deleting...' : 'Delete') 
              : (leaveGroupMutation.isPending ? 'Leaving...' : 'Leave')
            }
          </button>
        </div>
      ))}
    </div>
  )
}

export default GroupList