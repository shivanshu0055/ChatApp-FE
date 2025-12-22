import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

const PendingRequestCard = ({senderID,receiverID,requestID,status,senderUsername}) => {
    
    const token=useAuthStore(state=>state.token);
    const queryClient = useQueryClient();

    const acceptMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post("http://localhost:3000/api/friend/acceptFriendRequest",{
                requestID:requestID
            },{
                headers:{
                    "Authorization":`Bearer ${token}`
                }
            })
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pendingRequests']);
        }
    });

    const declineMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post("http://localhost:3000/api/friend/rejectFriendRequest",{
                requestID:requestID
            },{
                headers:{
                    "Authorization":`Bearer ${token}`
                }
            })
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pendingRequests']);
        }
    });

    return (
        <>
            
                <div className='flex justify-between px-2 py-3 border-2'>
                    <div>
                        <div>{senderUsername}</div>
                        <div>{senderID}</div>
                    </div>
                    <div>
                        <button 
                            className='bg-green-400 px-2 py-1 rounded-2xl mx-2'
                            onClick={() => acceptMutation.mutate()}
                            disabled={acceptMutation.isPending}
                        >
                            {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
                        </button>
                        <button 
                            className='bg-red-400 px-2 py-1 rounded-2xl mx-2'
                            onClick={() => declineMutation.mutate()}
                            disabled={declineMutation.isPending}
                        >
                            {declineMutation.isPending ? 'Declining...' : 'Decline'}
                        </button>
                    </div>
                </div> 
                
        </>
    )
}

export default PendingRequestCard