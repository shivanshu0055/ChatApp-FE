import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { use } from 'react'
import FriendCard from './FriendCard';
import { useAuthStore } from '../stores/authStore';

const FriendList = () => {

    const token=useAuthStore(state=>state.token);

    const {data,isLoading,isError,error}=useQuery({
        queryKey:['friendData'],
        queryFn: ()=>{
            return axios.get("http://localhost:3000/api/user/getFriends",{
                headers:{
                    "Authorization":`Bearer ${token}`
                }
            })
                         
        }
    })

    if(isLoading) return <p>Loading...</p>
    if(isError) return <p>Error: {error.message}</p>

  return (
    <div className="w-fit mx-auto ">
    {
        data.data.friends.length === 0 ? (
            <p>No friends found</p>
        ) : (       
            data.data.friends.map((friend) => (
                <FriendCard key={friend._id} userID={friend._id} username={friend.username} />
            ))
        )   
    }
    </div>
  )
}

export default FriendList