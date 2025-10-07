import { useMemo, useState } from "react";
import { IoIosAddCircle, IoIosCloseCircle } from "react-icons/io";
import UserAvatar from "../../../components/util/UserAvatar";
import { useGChatContext } from "../../../context/G_ChatContext";


// components/UserList.jsx
const ChatList = ({onSelect, selectedChat ,setActiveCont }) => {
  const [showChatOpt,setShowChatOpt] = useState(false);
  const {chats,state} = useGChatContext() 

  const skeletons = useMemo(()=>{
    return Array.from({length:Math.floor(Math.random() * 3) + 4}).map(()=>({
      messageLength:`${Math.floor(Math.random() * 40) + 50}%`,
      usernameLength:`${Math.floor(Math.random() * 40) + 70}px`
    }));
  },[])

  return (
    <div className="w-full  border-r border-[var(---color-border)] overflow-y-auto">
      <div className="flex justify-between items-center bg-[var(--nav-head)] text-[var(--nav-text)] p-3 ">
        <h3 className="text-lg font-semibold">Chats</h3>
        {
          !showChatOpt ?
          <IoIosAddCircle className="cursor-pointer" size={28} onClick={()=>setShowChatOpt(true)}/> :
          <IoIosCloseCircle  className="cursor-pointer" size={28} onClick={()=>setShowChatOpt(false)}/>
        }
      </div>
      <div className="relative min-h-[500px]">
        <div className={`absolute font-medium  w-full top-0 border-2  bg-[var(---color-bg)] text-[var(---color-text-light)]  rounded-b-xl border-var(---color-border) flex flex-col gap-3
            ${showChatOpt ? 'max-h-[300px] p-3' : 'max-h-0 p-0 opacity-0'} transition-all duration-300 overflow-hidden shadow-sm`}
            aria-disabled={showChatOpt}>
            <button onClick={()=>{setActiveCont("form"); setShowChatOpt(false)}} type="button" className="border-2 border-[var(---color-border)] rounded-md px-2 py-1 cursor-pointer">Create A group</button>
            <button onClick={()=>{setActiveCont('userlist'); setShowChatOpt(false)}} type="button" className="border-2 border-[var(---color-border)]  rounded-md px-2 py-1 cursor-pointer">Add new Chat (user)</button>
        </div>
        {
          state.loading ?
            skeletons.map((_,i)=>(
              <div key={i} className="flex gap-2.5 items-center px-2 my-4 ">
                <div style={{width:"32px",height:"32px"}} className={`border-2 p-1 rounded-full  border-[var(--border-default)] animate-heartbeat`}>

                </div>
                <div className="w-full">
                  <p style={{width:_.usernameLength}} className="font-medium bg-gray-400  h-[14px] rounded-full animate-heartbeat"></p>
                  <p style={{width:_.messageLength}} className="mt-2 text-sm text-gray-500  bg-gray-200 h-[14px] rounded-full animate-heartbeat">
                  </p>
                </div>
              </div>
            ))
          :
          chats.length === 0 ?
          <div className="pt-4 px-2">
            <p className="text-center text-lg">Start a new chat ! </p>
            <p className="text-center text-[var(---color-text-light)]">click below to see user list and start chatting  </p>
            <button onClick={()=>setActiveCont('userlist')} type="button" 
              className="w-full mt-4 hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200 bg-[var(--nav-head)] text-[var(--nav-text)]  border-2 border-[var(---color-border)]  rounded-md px-2 py-1 cursor-pointer">
                Start new Chat
            </button>
          </div>
          :
        chats.map((chat) => (
          chat.group === 'personal' ?
          <div
            key={chat.room}
            className={`p-3 cursor-pointer hover:bg-[var(--nav-hover)]  ${
              selectedChat?.room === chat.room ? 'bg-[var(--nav-active)]' : ''
            }`}
            onClick={() => onSelect(chat)}
          >
            <div className="flex gap-2.5 items-center">
              <div className={`border-2 p-1 rounded-full  ${chat.online ? 'border-[var(--border-correct)] ' : 'border-[var(--border-default)]'}`}>
                <UserAvatar name={chat.user.name} size={32} profile={chat.user.profile} />
              </div>
              <div>
                <p className="font-medium">{chat.user.name}</p>
                {chat.lastchat &&
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastchat.fromMe ? 'You : ':  
                    chat.lastchat.timestamp && 'Last : '} 
                    <span className={` ${chat.lastchat.status?.deleted && 'text-red-400 italic'}`} > {chat.lastchat.text} </span>
                </p>}
              </div>
            </div>
        
          </div>
          :
          <div
            key={chat.room}
            className={`p-3 cursor-pointer hover:bg-[var(--nav-hover)] ${
              selectedChat?.room === chat.room ? 'bg-[var(--nav-active)]' : ''
            }`}
            onClick={() => onSelect(chat)}
          >
            <p className="font-medium">{chat.groupName} Group</p>
            {chat.lastchat &&
              <p className="text-sm text-gray-500 truncate">
              {chat.lastchat.fromMe ? 'You : ': 
                chat.lastchat.timestamp && chat.user.username+':' } {chat.lastchat.text}
             </p>
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
