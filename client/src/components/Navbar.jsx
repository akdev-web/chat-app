import React, { useEffect, useState } from 'react'
import UserAvatar from './util/UserAvatar';
import useUserContext from '../context/UserContext';
import {IoMdChatbubbles} from 'react-icons/io';
import {MdQuiz} from 'react-icons/md';

import { useNavigate } from 'react-router-dom';

const Navbar = ({showUserOpt,setShowuUserOpt}) => {
    const {user,Logout} = useUserContext()
    const navigate = useNavigate();
  return (
    <nav className='z-99 fixed top-0 w-full py-2 px-4 flex justify-between items-center bg-[var(---color-nav-bg)] text-[var(---color-text)] 
                    transition-shadow duration-300 shadow-md dark:shadow-lg shadow-gray-200 dark:shadow-black'>
        <div>Logo</div>
        <div className='flex items-center gap-2 justify-end'>
            {
                user && 
                <div className='flex gap-3 items-center'>
                    <IoMdChatbubbles className='cursor-pointer' size={28} onClick={()=>navigate("/chat",{replace:true})}/>
                    <div onClick={() => setShowuUserOpt(prev=>!prev)}>
                        <UserAvatar  className='cursor-pointer' profile={user.profile} name={user.username} size={32}/>
                    </div>
                    <div className={`flex flex-col gap-2.5 min-w-[350px] ${showUserOpt ? 'max-h-[400px] p-4 pointer-events-auto' : 'max-h-0 p-0 opacity-0 pointer-events-none'} 
                        overflow-hidden transition-all duration-300  absolute top-[60px] right-6 bg-[var(---color-bg)] rounded-md shadow-sm `}
                        aria-disabled={!showUserOpt}>
                        <div className='flex gap-2.5 justify-start items-center cursor-pointer' onClick={()=>navigate('/user',{replace:true})}>
                            <UserAvatar profile={user.profile} name={user.username} size={48}/>
                            <div className='flex flex-col justify-start'>
                                <h4 className='text-lg'>{user.username}</h4>
                                <span className='block text-sm text-gray-500'>view profile</span>
                            </div>
                        </div>
                        <div className=' border-t-gray-400 border-t-2 h-0 '></div>
                        <button disabled={!showUserOpt} onClick={Logout} 
                            className={`w-full bg-black text-white text-lg py-2 px-4 rounded-md cursor-pointer disabled:cursor-not-allowed`}>
                            Logout
                        </button>
                    </div>
                </div>
            }
            
        </div>
    </nav>
  )
}

export default Navbar