import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

const CreateGroup = () => {
  const { token } = useAuthStore()
  const [groupName, setGroupName] = useState('')
  const queryClient = useQueryClient()

  const createGroupMutation = useMutation({
    mutationFn: (data) => axios.post('http://localhost:3000/api/chat/createChat', data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      setGroupName('')
      toast.success('Group created successfully!')
    },
    onError: (error) => {
      toast.error('Error creating group: ' + error.response?.data?.message || error.message)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!groupName.trim()) return
    createGroupMutation.mutate({ isGroupChat: true, groupName })
  }

  return (
    <div className="w-92 rounded-lg mx-auto h-fit bg-white p-4 text-black">
  
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="w-full px-2 py-1 border rounded"
          required
        />
        <button
          type="submit"
          disabled={createGroupMutation.isPending}
          className="bg-[#0a0a0a] rounded-lg px-3 my-1 py-1 text-white font-sm flex items-center gap-2 justify-center cursor-pointer"
        >
          {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  )
}

export default CreateGroup