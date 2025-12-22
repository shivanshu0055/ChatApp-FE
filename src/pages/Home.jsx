import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import FriendCard from '../components/FriendCard';
import {useQuery} from "@tanstack/react-query"
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import CurrentListToggle from '../components/CurrentListToggle';
import ListContainer from '../components/ListContainer';

const Home = () => {
  
  const username=useAuthStore(state=>state.username);
  const token=useAuthStore(state=>state.token);
  const logout=useAuthStore(state=>state.logout)

  return (
    <>
    <h1 className='text-center font-bold text-4xl mt-10'>
      Welcome to ChatApp {username} 
    </h1>
    <div className='w-fit bg-red-300 px-3 py-2 mx-auto my-5 rounded-2xl border cursor-pointer' onClick={()=>{
      logout()
      navigate("/signup")
    }}>LOG OUT</div>
    <SearchBar></SearchBar>
    <CurrentListToggle></CurrentListToggle>
    <ListContainer></ListContainer>
    </>
  );
};

export default Home;
