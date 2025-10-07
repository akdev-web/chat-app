import React, { createContext, useContext } from 'react'

const ChatContext = createContext();

export const ChatContextProvider = ({children}) => {
  return (
    <ChatContext.Provider value={{}}>
        {children}
    </ChatContext.Provider>
  )

}

export const useChatContext = () => useContext(ChatContext);