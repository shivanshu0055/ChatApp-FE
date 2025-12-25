import React, { use } from 'react'
import { Link } from 'react-router-dom'
import { BsChatSquareQuoteFill } from "react-icons/bs";
import { CiLogout } from "react-icons/ci";
import { CiLogin } from "react-icons/ci";
import { IoPersonAddOutline } from "react-icons/io5";
import { useAuthStore } from '../stores/authStore';

const LandingPage = () => {
    const isAuthenticated=useAuthStore((state)=>state.isAuthenticated);
    const logout=useAuthStore((state)=>state.logout);

    return (
        <>
        <div className="h-screen w-full text-white font-Geist bg-[#0a0a0a]
[background-image:radial-gradient(circle,_rgba(255,255,255,0.15)_1.5px,_transparent_1px)]
[background-size:18px_18px]
[background-position:0_0]">
            <div className='px-5 py-4 flex justify-between'>
                <div className='flex gap-3 items-center'>
                    <BsChatSquareQuoteFill className='text-3xl'/>
                    <div className='text-3xl font-semibold'>Chatify</div>
                </div>
                <div className='flex gap-4'>
                    {!isAuthenticated ? <>
                    <div className='bg-white rounded-2xl px-3 py-1 text-black font-medium flex items-center gap-2 justify-center cursor-pointer'>
                        <CiLogin className='text-xl'/>
                        <Link to="/signin">SignIn</Link>
                    </div>
                    <div className='bg-white rounded-2xl px-3 py-1 text-black font-medium flex items-center gap-2 justify-center cursor-pointer'>
                        <IoPersonAddOutline className='text-lg'/>
                        <Link to="/signup">SignUp</Link>
                    </div>
                    </>:
                    <div className='bg-white rounded-2xl px-3 py-1 text-black font-medium flex items-center gap-2 justify-center cursor-pointer'>
                        <CiLogout className='text-lg'/>
                        <div onClick={logout}>Logout</div>
                    </div>}
                </div>
            </div>
            <div className='my-20 text-center px-5'>
                <div className='text-6xl font-semibold -tracking-wide leading-16 w-[60%] mx-auto'>
                One Platform for Every Conversation That Matters
                </div>
                <div className='my-4 text-xl w-[40%] mx-auto text-gray-400'>
                    Private messages, powerful groups, and crystal-clear video calls — built for real connection
                </div>
                <div className='my-6'>
                    <div className='bg-white rounded-2xl px-4 py-2 text-black font-medium flex items-center gap-2 justify-center cursor-pointer w-fit mx-auto'>
                        <Link to="/signin">Get Started ✨</Link>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default LandingPage