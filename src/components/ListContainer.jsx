import React from 'react'
import { useAuthStore } from '../stores/authStore'
import FriendList from './FriendList'
import PendingRequestList from './PendingRequestList'
import ChatList from './ChatList'
import PublicGroupList from './PublicGroupList'
import GroupList from './GroupList'
import CreateGroup from './CreateGroup'

const ListContainer = () => {
    const currentList=useAuthStore((state)=>state.currentList)
    
    if(currentList==="friends"){
        return <FriendList />
    }
  
    if(currentList==="pending"){
        return <PendingRequestList/>   
    }

    if(currentList==="chatList"){
        return <ChatList/>    
    }

    if(currentList==="groups"){
        return <GroupList/>    
    }

    if(currentList==="publicGroups"){
        return <PublicGroupList/>    
    }

    if(currentList==="createGroup"){
        return <CreateGroup/>    
    }
}

export default ListContainer