// components/MessageList.jsx
import SentMessage from './SentMessage';
import RecievedMessage from './RecievedMessage';
import { useEffect,  useRef, useState } from 'react';

const MessageList = ({chat,messages, onDelete,onRetry }) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const messageLenRef = useRef(messages.length);

  const scrollToBottom = () =>{
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  // useEffect(()=>{
  //   if(messages.length===0) return;
  //   if(messages.length !== messageLenRef.current){
  //     scrollToBottom();
  //   }else bottomRef.current?.scrollIntoView({ behavior: "instant" });
  //   messageLenRef.current = messages.length;
  // },[messages])

  useEffect(()=>{
    const container = containerRef.current;
    if(!container) return;
    const observer = new ResizeObserver(()=>{scrollToBottom()})

    observer.observe(container);

    return ()=>{
      observer.unobserve(container);
    }
  },[])

  return (
    <div className="flex-1  px-4 py-2 space-y-2 relative"
      ref={containerRef}
    >
      {messages.map((msg, index) => {

        switch (msg.type) {
          case 'user':
            if(msg.isSender){ 
              return <SentMessage key={index}  msg={msg} isPersonal={chat.isPersonal} onDelete={onDelete} onRetry={onRetry} />
            }
            return <RecievedMessage key={index} msg={msg}   />
          case 'system':
            return <div
              key={index}
              className={`mx-auto rounded-lg max-w-[50%]  my-10 '
                }`}
            >
               <p className="text-center text-sm text-[var(--msg-system)] font-medium">
                {msg.text}
              </p>
            </div>
          default:
            return;
        }
      })}
      <div ref={bottomRef}></div>
    </div>
  );
};

export default MessageList;
