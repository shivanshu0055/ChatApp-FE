import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import FriendCard from '../components/FriendCard';
import {useQuery} from "@tanstack/react-query"
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import GroupSearchBar from '../components/GroupSearchBar';
import { useNavigate } from 'react-router-dom';
import CurrentListToggle from '../components/CurrentListToggle';
import ListContainer from '../components/ListContainer';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { CiLogout } from 'react-icons/ci';
import { BsChatSquareQuoteFill } from 'react-icons/bs';

const Home = () => {
  
  const username=useAuthStore(state=>state.username);
  const token=useAuthStore(state=>state.token);
  const userID=useAuthStore(state=>state.userID);
  const logout=useAuthStore(state=>state.logout)
  const [socket, setSocket] = useState(null);
  const queryClient = useQueryClient();
  const navigate=useNavigate();
  
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('connected', () => {
      console.log('Connected to socket on home');
    });

    newSocket.on('notify-new-message', (data) => {
      console.log('New message notification:', data);
      // Update chat lists to show new last message
      queryClient.setQueryData(['chatList'], (oldData) => {
        if (!oldData) return oldData
        
        const updatedList = oldData.map(chat => {
          if (chat._id === data.chatID) {
            return {
              ...chat,
              lastMessage: {
                _id: data._id,
                content: data.content,
                sender: data.sender
              },
              updatedAt: new Date().toISOString()
            }
          }
          return chat
        })
        
        // Sort by updatedAt to move the chat to top
        updatedList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        
        return updatedList
      })
      
      queryClient.setQueryData(['groups'], (oldData) => {
        if (!oldData) return oldData
        
        const updatedList = oldData.map(group => {
          if (group._id === data.chatID) {
            return {
              ...group,
              lastMessage: {
                _id: data._id,
                content: data.content,
                sender: data.sender
              },
              updatedAt: new Date().toISOString()
            }
          }
          return group
        })
        
        // Sort by updatedAt to move the group to top
        updatedList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        
        return updatedList
      })
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, queryClient]);

  return (
    <div className="h-screen w-full text-white font-Geist bg-[#0a0a0a]
[background-image:radial-gradient(circle,_rgba(255,255,255,0.15)_1.5px,_transparent_1px)]
[background-size:18px_18px]
[background-position:0_0]">
      
    <div className='px-5 py-4 flex justify-between'>
      <div className='flex gap-3 items-center'>
                          <BsChatSquareQuoteFill className='text-3xl'/>
                          <div className='text-3xl font-semibold'>Chatify</div>
                      </div>
      <div  onClick={()=>{
          logout()
          navigate("/")
        }} className='bg-white rounded-2xl px-3 py-1 text-black font-medium flex items-center gap-2 justify-center cursor-pointer'>
        <CiLogout className='text-lg'/>
        <div>Logout</div>
      </div>
    </div>
    <CurrentListToggle></CurrentListToggle>
    <SearchBar></SearchBar>
    <GroupSearchBar></GroupSearchBar>
    
    <ListContainer></ListContainer>
    </div>
  );
};

export default Home;
