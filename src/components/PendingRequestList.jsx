import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import PendingRequestCard from './PendingRequestCard';

const PendingRequestList = () => {

    const token=useAuthStore(state=>state.token);

    const {data, isLoading, isError} = useQuery({
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

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error fetching requests</p>;

  return (
    <div className="w-fit mx-auto">
    {
        data.length === 0 ? (
            <p>No pending requests</p>
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