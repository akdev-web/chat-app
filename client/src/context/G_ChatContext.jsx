import React, { createContext, useContext, useEffect, useState } from 'react'
import { chat } from '../components/api';
import useUserContext from './UserContext';

const ChatGContext = createContext();

export const G_ChatContextProvider = ({children}) => {
  const {user} = useUserContext();
  const [chats,setChats] = useState([])
  const [state, setState] = useState({ loading: true, res: null,err:null });

  useEffect(() => { // chat list where user starts a chat
    console.log('g chat mounted');
    if(!user) return console.log('not logged in return');
    let skeltenTimeout; //  chatlist loading skelton timeout

    async function getChatsList() {
      setState({ res: null,err:null, loading: true })
      try {
        const res = await chat.get('/');
        const data = res.data;
        if (data.success) {
          setChats(data.data);
          skeltenTimeout = setTimeout(()=>{ // a secnod delay to hide loading skelton
            setState({ res: data.success, loading: false })
          },1000)
        }
      } catch (error) {
        setState({ err: error.response?.data, loading: false })
        console.log(error);
      }
    }
    getChatsList();

    return ()=>{
      console.log('g context unmounted');
      clearTimeout(skeltenTimeout);
    }
  }, [user])
  
  return (
    <ChatGContext.Provider value={{chats,setChats,state}}>
        {children}
    </ChatGContext.Provider>
    )
}

export const useGChatContext = () => useContext(ChatGContext);