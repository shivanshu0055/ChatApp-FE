import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import UserSearchBarCard from './UserSearchBarCard';

const SearchBar = () => {
    const token=useAuthStore((state)=>state.token)
    const [query,setQuery]=useState()
    const [modal,setModal]=useState(false)

    const {data,refetch,isSuccess,isFetching,isError}=useQuery({
        queryKey:["Search-Users",query],
        enabled:false,
        queryFn:async ({ queryKey })=>{
            const res=await axios.post(`http://localhost:3000/api/user/searchUsers?username=${queryKey[1]}`,null,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            return res.data
        }
    })

    return(
        <>
        <div className='flex gap-4 w-fit mx-auto my-7'>
            <input placeholder='Search for users and groups' type="text" className='border rounded-4xl w-80 px-2 text-sm'  onChange={(e)=>setQuery(e.target.value)}/>
            <button className='bg-black rounded-4xl text-white px-4 py-1' 
                onClick={()=>{
                if (!query?.trim()) return;
                refetch()
                setModal(true)}
                }>
                    Search
                </button>
        </div>
        {modal && <div className='w-90 px-10 py-2 border mx-auto'>
            {isFetching && <p>Loading...</p>}

          {isError && <p>Error fetching users</p>}

          {isSuccess && data?.users?.length === 0 && (
            <p>No users found</p>
          )}

          {isSuccess &&
            data?.users?.map((user,index) => (
              <UserSearchBarCard key={index} username={user.username} userID={user._id} sentRequests={user.sentRequests} receivedRequests={user.receivedRequests} friends={user.friends}>
              </UserSearchBarCard>
            ))}
        </div>}
        </>
    )
};


export default SearchBar