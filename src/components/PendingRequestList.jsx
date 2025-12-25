import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import PendingRequestCard from './PendingRequestCard';
import { HashLoader } from 'react-spinners';

const PendingRequestList = () => {

    const token=useAuthStore(state=>state.token);

    const {data, isLoading, isError,error} = useQuery({
        queryKey: ['pendingRequests'],
        queryFn: async () => {
            const res=await axios.post("http://localhost:3000/api/friend/getPendingRequests",null,{
                headers:{
                    "Authorization":`Bearer ${token}`
                }
            })
            return res.data
        },
        select: (data) => {  
            return data.requests.filter((request) => request.status === 'Pending');
        }
    });

    if(isLoading) return 
    <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center ">
        <HashLoader size={20}/>
    </div>

    if(isError) return <div className="w-92 rounded-lg mx-auto h-105 bg-white p-2 flex justify-center items-center text-center text-black">
        {error.message}
    </div>

  return (
    <div className="w-92 mx-auto h-105 bg-white p-2 rounded-lg">
    {
        data.length == 0 ? (
            <p className='text-black/60 text-center font-medium'>No pending requests</p>
        ) : (
            data.map((request) => (
                <PendingRequestCard 
                    senderUsername={request.senderID.username}
                    key={request._id}   
                    requestID={request._id}
                    senderID={request.senderID._id}
                    receiverID={request.receiverID}
                    status={request.status}
                />
            ))
        )
    }
    </div>
  )
}

export default PendingRequestList