import { useQuery } from '@tanstack/react-query'
import React from 'react'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import GroupSearchBarCard from './GroupSearchBarCard'
import { HashLoader } from 'react-spinners'

const PublicGroupList = () => {
  const { token } = useAuthStore()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recentGroups"],
    queryFn: () => axios.post(`http://localhost:3000/api/user/getRecentGroups`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data.recentGroups)
  })

  if(isLoading) return 
    <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center ">
        <HashLoader size={20}/>
    </div>

    if(isError) return <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center text-center text-black">
        {error.message}
    </div>

  return (
    <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 text-black">
      {data && data.map(group => (
        <GroupSearchBarCard key={group._id} groupName={group.groupName} _id={group._id} />
      ))}
    </div>
  )
}

export default PublicGroupList