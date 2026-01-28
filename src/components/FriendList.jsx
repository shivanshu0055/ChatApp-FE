import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { use } from 'react'
import FriendCard from './FriendCard';
import { useAuthStore } from '../stores/authStore';
import {HashLoader} from 'react-spinners'
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

    if(isLoading) return (
    <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center ">
        <HashLoader size={20} color="#000000" />
    </div>
    )

    if(isError) return <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center text-center text-black">
        {error.message}
    </div>

  return (
    <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2">
    {
        data.data.friends.length == 0 ? (
            <p className='text-black/60 text-center font-medium'>No friends found</p>
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