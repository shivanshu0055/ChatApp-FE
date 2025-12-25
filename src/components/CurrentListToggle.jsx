import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

const CurrentListToggle = () => {

    const setCurrentList=useAuthStore((state)=>state.setCurrentList)
    const currentList=useAuthStore((state)=>state.currentList)

  return (
    <div className='flex bg-white py-1 px-2 w-fit mx-auto rounded-2xl justify-center gap-3 my-6 font-Geist'>
        <div className={`text-sm rounded-xl cursor-pointer border-2 border-gray-300 px-2 py-1 ${currentList === "friends" ? "bg-black text-white" : "bg-white/90 text-black"}`} onClick={() => setCurrentList("friends")}>Friends</div>
        <div className={`text-sm rounded-xl cursor-pointer border-2 border-gray-300 px-2 py-1 ${currentList === "pending" ? "bg-black text-white" : "bg-white/90 text-black"}`} onClick={() => setCurrentList("pending")}>Requests</div>
        <div className={`text-sm rounded-xl cursor-pointer border-2 border-gray-300 px-2 py-1 ${currentList === "chatList" ? "bg-black text-white" : "bg-white/90 text-black"}`} onClick={() => setCurrentList("chatList")}>ChatList</div>
        <div className={`text-sm rounded-xl cursor-pointer border-2 border-gray-300 px-2 py-1 ${currentList === "groups" ? "bg-black text-white" : "bg-white/90 text-black"}`} onClick={() => setCurrentList("groups")}>Groups</div>
        <div className={`text-sm rounded-xl cursor-pointer border-2 border-gray-300 px-2 py-1 ${currentList === "publicGroups" ? "bg-black text-white" : "bg-white/90 text-black"}`} onClick={() => setCurrentList("publicGroups")}>Public Groups</div>
        <div className={`text-sm rounded-xl cursor-pointer border-2 border-gray-300 px-2 py-1 ${currentList === "createGroup" ? "bg-black text-white" : "bg-white/90 text-black"}`} onClick={() => setCurrentList("createGroup")}>Create Group</div>
    </div>
  )
}

export default CurrentListToggle