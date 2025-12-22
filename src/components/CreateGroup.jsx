import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
      alert('Group created successfully!')
    },
    onError: (error) => {
      alert('Error creating group: ' + error.message)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!groupName.trim()) return
    createGroupMutation.mutate({ isGroupChat: true, groupName })
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create New Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={createGroupMutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  )
}

export default CreateGroup