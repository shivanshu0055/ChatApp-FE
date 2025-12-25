import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import { TiTickOutline } from "react-icons/ti";
import { CiNoWaitingSign } from "react-icons/ci";

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
                <div className='border-2 border-gray-300 bg-white text-black w-full px-3 py-1.5 rounded-lg my-1 hover:bg-black hover:text-white text-left transition-all duration-300 ease-in-out flex justify-between items-center'>
                    <div>
                        <div>{senderUsername}</div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button 
                            className='bg-green-400 px-2 py-1 rounded-xl cursor-pointer'
                            onClick={() => acceptMutation.mutate()}
                            disabled={acceptMutation.isPending}
                        >
                            <TiTickOutline className='text-xl'></TiTickOutline>
                        </button>
                        <button 
                            className='bg-red-400 px-2 py-1 rounded-xl cursor-pointer'
                            onClick={() => declineMutation.mutate()}
                            disabled={declineMutation.isPending}
                        >
                            <CiNoWaitingSign className='text-xl'></CiNoWaitingSign>
                        </button>
                    </div>
                </div> 
                
        </>
    )
}

export default PendingRequestCard