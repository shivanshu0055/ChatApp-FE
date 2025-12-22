import { useQuery } from '@tanstack/react-query'
import React from 'react'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import GroupSearchBarCard from './GroupSearchBarCard'

const PublicGroupList = () => {
  const { token } = useAuthStore()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recentGroups"],
    queryFn: () => axios.post(`http://localhost:3000/api/user/getRecentGroups`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data.recentGroups)
  })

  if (isLoading) return <div>Loading recent groups...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div className="public-group-list">
      <h3 className="text-center mb-4">Recent Public Groups</h3>
      {data && data.map(group => (
        <GroupSearchBarCard key={group._id} groupName={group.groupName} _id={group._id} />
      ))}
    </div>
  )
}

export default PublicGroupList