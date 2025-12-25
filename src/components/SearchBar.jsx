import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import UserSearchBarCard from './UserSearchBarCard';
import { CiSearch } from "react-icons/ci";
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className='font-Geist flex gap-2 w-fit mx-auto bg-white rounded-2xl px-3 py-1.5'>
            <input placeholder='Search for users ' type="text" className='px-2 py-0.5 text-sm bg-white/50 rounded-xl border-2 border-gray-300 outline-none text-black w-80'  onChange={(e)=>setQuery(e.target.value)}/>
            <motion.button className='cursor-pointer' 
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={()=>{
                if (!query?.trim()) return;
                refetch()
                setModal(true)}
                }>
                    <CiSearch className='text-2xl text-black'/>
                </motion.button>
        </div>
        <AnimatePresence>
        {modal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed backdrop-blur-md inset-0 bg-black/70 flex items-center justify-center z-50" 
                onClick={() => setModal(false)}
            >
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-lg font-semibold mb-4 text-black">Search Results</h3>
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
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
        </>
    )
};


export default SearchBar