import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { Navigate, Outlet  } from 'react-router-dom'
import useUserContext from '../context/UserContext'

const Layout = () => {

  const {user,authenticating} = useUserContext()
  const [showUserOpt,setShowuUserOpt] = useState(false);
  if(authenticating){
    console.log('authencting from layout ...');
    return;
  } 
  if(!user) return <Navigate to='/login' replace={true} state={{alert:{msg:'You are logged out !',type:'err'}}} />

  const hideUserOpt = () =>{
    if(!showUserOpt) return;
    setShowuUserOpt(false)
  }
  return (
    <div className='w-full min-h-screen h-full bg-[var(---color-body-bg)] text-[var(---color-text)]  '>
        <Navbar  showUserOpt={showUserOpt} setShowuUserOpt={setShowuUserOpt} />
        <div className='w-full min-h-screen  pt-[100px] ' onClick={hideUserOpt}>
            <Outlet />
        </div>
    </div>
  )
}

export default Layout