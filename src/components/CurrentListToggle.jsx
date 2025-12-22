import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

const CurrentListToggle = () => {

    const setCurrentList=useAuthStore((state)=>state.setCurrentList)

  return (
    <div className='flex justify-center gap-10 my-4'>
        <div className='bg-gray-400 rounded-4xl cursor-pointer border px-2 py-1' onClick={() => setCurrentList("friends")}>Friends</div>
        <div className='bg-gray-400 rounded-4xl cursor-pointer border px-2 py-1' onClick={() => setCurrentList("pending")}>Pending Requests</div>
        <div className='bg-gray-400 rounded-4xl cursor-pointer border px-2 py-1' onClick={() => setCurrentList("chatList")}>ChatList</div>
        <div className='bg-gray-400 rounded-4xl cursor-pointer border px-2 py-1' onClick={() => setCurrentList("groups")}>Groups</div>
        <div className='bg-gray-400 rounded-4xl cursor-pointer border px-2 py-1' onClick={() => setCurrentList("publicGroups")}>Public Group Chats</div>
        <div className='bg-gray-400 rounded-4xl cursor-pointer border px-2 py-1' onClick={() => setCurrentList("createGroup")}>Create Group</div>
    </div>
  )
}

export default CurrentListToggle