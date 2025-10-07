import React from 'react'
import useSocket from '../../context/SocketContext';
import { useEffect } from 'react';
import ChatHeader from './component/ChatHeader';
import MessageList from './component/MessageList';

import { useState } from 'react';
import ChatList from './component/ChatList';
import api, { chat } from '../../components/api';
import AddChatList from './component/AddChatList';
import InsertDateBreakpoints from './util/InstertDatebreakPoints.js';
import GroupDetails from './component/GroupDetails.jsx';
import GroupForm2 from './component/GroupFormV2.jsx';
import ToastMsg from '../../components/util/AlertToast.js';
import InviteUsers from './component/Inviteuser.jsx';
import { useScreenSize } from '../../components/util/ScreenSizeContext.jsx';
import ChatInputV2 from './component/ChatInput2.jsx';
import useUpload from '../../components/hooks/UploadHook.js';
import { useGChatContext } from '../../context/G_ChatContext.jsx';
import { usePendingMessages } from '../../components/hooks/pendingMsgHook.js';
import { TimeOutManager } from '../../components/util/TimeoutManager.js';




const Chat = () => {
  const { socket, isSocketconnected } = useSocket();
  const { chats, setChats, state } = useGChatContext();
  const { screensize } = useScreenSize()
  const [users, setUsers] = useState([]);

  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();// to heihglitht selected user only
  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [activeView, setActiveView] = useState("users"); // 'users' or 'chat'
  const [activeCont, setActiveCont] = useState("chat");
  
  const {
    addPending,
    updatePending,
    removePending,
    replacePending,
    getPending,
    getByStatus,
  } = usePendingMessages(selectedChat);

  useEffect(() => {
    if (!state.res) return;
    if (chats.length === 0) return;

    const lastSelectedChat = localStorage.getItem('chat_app_0.01_selectedChat') || null;
    const selected = lastSelectedChat && chats.find(c => c.room === lastSelectedChat);
    if (!lastSelectedChat || !selected) {
      handleSelectChat(chats[0])
      localStorage.setItem('chat_app_0.01_selectedChat', chats[0].room);
      return;
    }
    handleSelectChat(selected)
  }, [chats, state])

  const updtImagesProg = ({ prog, state, progMessage, chat }) => {
    setSelectedChat(prev => {
      if (prev.room === chat.room) {
        const update = prev.messages.map(m => {
          if (m.msgId && (m.msgId === chat.msgId)) {
            return {
              ...m, prog: {
                progress: prog,
                state: state,
                msg: progMessage,
              }
            }
          }
          return m;
        })
        return { ...prev, messages: update }
      }
      return prev;
    })
  }
  const { upl_Response, upload, resetUpload } = useUpload({ progressUpdater: updtImagesProg });

  console.log('selectedchat :', selectedChat)
  // console.log('active :',activeUsers)


  const handleSelectUser = (user) => { // start and join a new chat with selected user
    setSelectedUser(user); // heightlight selected 
    socket.current.emit('new-chat', { user }); // join new chat
  };

  const handleSelectChat = (chat) => {  // join chat when user select chat from chatlist
    socket.current.emit('join-chat', { room: chat.room });
    setSelectedChat(chat);
    setActiveView("chat"); // Switch to chat view on mobile
  };


  const handleSendMessage = ({ text, images, retry }) => {

    const updateChatState = ({ status, room, pid }) => {
      setSelectedChat(prev => {
        if (room !== prev.room) return prev;
        if (!prev.messages || prev.messages.length === 0) return prev;
        const msgwithRetry = prev.messages.map((m) => {
          if (pid && (pid === m.pid))

            return {
              ...m,
              state: status,
            }
          else return m;
        })
        return { ...prev, messages: msgwithRetry };
      })
    }

    console.log(images);
    const id = crypto.randomUUID();
    const data =
      retry ? retry :
        {
          room: selectedChat.room,
          text,
          pid:id,
        };

    if (!retry) {
      if (images && images.length > 0) {
        data.images = images.map(img => img.name)
      }
      
      addPending(id,{...data,images});

      const previewMessage = {
        ...data,
        type: 'user',
        images: images?.map((file) => ({ preview: URL.createObjectURL(file), filename: file.name })) || [],
        isSender: true,
        sender:socket.current.user.userId,
        state: 'sending',
      }

      setSelectedChat(prev => {
        return { ...prev, messages: [...prev.messages, previewMessage] }
      })
    } else {
      updateChatState({ status: 'sending', ...retry });
    }

    console.log('send-chat', data);
    socket.current.emit('send-chat', data);
    const ScheduleRetry = () => {
      console.log('retry-called');
      let status = 'retryable';
      const {success,message:result} = getPending(id);
      if(!success) return; // return msg is already ack
      if (!['retryable', 'pending'].includes(result?.status)) return;
      console.log(`${result.retries} times tried`)

      if((result.retries ?? 1) >= 4) { status = 'failed' };
    
      const updateResult = updatePending(id,{status});
      updateResult && updateChatState({status, ...result })

    };

    TimeOutManager.add(id,ScheduleRetry);
  }

  const deleteMessage = (msg) => {
    console.log(msg, 'requested to delete');
    socket.current.emit('delete-msg', msg);
  }


  useEffect(() => { //user list to start new chat
    async function getUsersList() {
      try {
        const res = await api.get('/user/knowns');
        const data = res.data;
        if (data.success) {
          ;
          setUsers(data.data);
          setSelectedUser(users[0])
        }
      } catch (error) {
        console.log(error);
      }
    }
    getUsersList();
  }, [])



  useEffect(() => { // update chatlist status  on base of active users (online / offline)
    if (activeUsers.length > 0) {
      setChats((prev) =>
        prev.map((p) => {
          if (p.group === 'personal') {
            if (activeUsers.includes(p.user.userId)) {
              return { ...p, online: true }
            }
            return { ...p, online: false }
          }
          return p;
        })
      )
      return;
    }
    setChats((prev) => prev.map((p) => {
      if (p.group === 'personal') { return { ...p, online: false } }
      return p;
    }))
  }, [activeUsers])

  useEffect(() => { // chat events 
    console.log(socket.current, isSocketconnected);
    const conn = socket.current;
    if (!conn || !isSocketconnected) return;



    conn.emit('online-users', { refresh: true });

    const handleOnlineUsers = (data) => {
      console.log('online : ', data);
      setActiveUsers(prev => {
        let newOnline = data.filter(d => !prev.includes(d))
        return [...prev, ...newOnline]
      })
      setSelectedChat(prev => {
        if (prev?.isPersonal && data.includes(prev.user.userId)) {
          return { ...prev, online: true }
        }
      })
    }

    const handleOfflineUsers = ({ user }) => {
      setActiveUsers(prev =>
        prev.filter(p => !p.includes(user.userId))
      )
      setSelectedChat(prev => {
        if (prev?.isPersonal && user.userId === prev.user.userId) {
          return { ...prev, online: false }
        }
      })
    }

    const handleNewChatJoin = (chat) => {
      setSelectedChat(chat);
      setChats(prev => [chat, ...prev]);
    }

    const handleUserJoined = (data) => {
      console.log('user-joined', data);
      setSelectedChat(prev => {
        if (prev && (prev.room === data.room)) {
          if (!prev.messages || prev.messages.length === 0) return;
          const readmessages = prev.messages.map(msg => {
            if (msg.sender !== data.userId) {
              return { ...msg, state: ['delivered', 'sent'].includes(msg.state) ? 'read' : msg.state }
            }
            else return msg;
          });
          return { ...prev, messages: readmessages }
        }
        return prev;
      })
    }

    const handleChatMsg = (data) => {
      const messages = InsertDateBreakpoints(data);
      setSelectedChat(prev => ({ ...prev, messages }));
    }





    const handlePrivateChat = ({ room, msg }) => {
      const msgByme = conn.user.userId === msg.sender;
      let newMsg = {
        ...msg,
        type: 'user',
        isSender: msgByme,
      }

      setSelectedChat(prev => {
        if (prev?.room !== room) {
          !msgByme && conn.emit('delv-msg', { chat: { room, msg } });
          return prev;
        }
        !msgByme && conn.emit('read-msg', { chat: { room, msg } });
        const update = { ...prev, messages: [...(prev.messages || []), newMsg] }
        return update;
      })
      setChats(prev =>
        prev.map(p => {
          if (p.room === room)
            return { ...p, lastchat: newMsg }
          return p;
        })
      )
    }

    const handleMessageAck = async ({ room, msg }) => {
      console.log('messag ack receive', room, msg)
      const {msgId,pid} = msg;

      // remove schedule retry
      TimeOutManager.remove(pid);


      const updateChatState = (status_) => {
        setSelectedChat(prev => {
          if (room !== prev.room) return prev;
          if (!prev.messages || prev.messages.length === 0) return prev;
          const update = prev.messages.map((m) => {
            if ( (pid && pid === m.pid ) || (msgId && msgId === m.msgId))

              return {
                ...m, ...msg,
                images: m.images, // keep message images preview or old images array
                state: status_,
              }
            else return m;
          })
          return { ...prev, messages: update };
        })
      }

      const result = getPending(pid);
      if(!result.success) return;

      
      const { images } = result.message;
      // if no images the message is sent successfully
      if (!images || images.length === 0) {


        let res = removePending(pid);
        if (res.success) {
          console.log('message acknowldge and deleted');
          updateChatState('sent')
          return;
        }
      }

      // else upload images
      try {
        const {state:status,...message} = msg;
        if(replacePending(pid,msgId,{...message,images,status})){
          updateChatState('uploading')
        }


        const res = await upload({
          e: null, uploadUrl: 'images_msg',
          formdata: { msg: msgId, room },
          file: { field: 'images', value: images }
        });

        console.log(`uploaded successfully `, res);


      } catch (error) {
        console.log('Upload Error :', error);

        const res = updatePending(msgId,{...msg,status:'failed'});
        res.success && updateChatState('failed')
        console.log('update pending Result :',res);
      }


    }

    const handleUploadAck = async ({msgId}) => {
      removePending(msgId);
    }


    const handleReadedMessage = ({ chat }) => {
      console.log('readed msg :', chat);
      setSelectedChat(prev => {
        if (prev.room !== chat.room) { return prev; }
        const readmessages = prev.messages.map(msg => {
          console.log('readed messages :', msg.sender === socket.current.user?.userId , msg.timestamp <= chat.msg.timestamp , msg.text);
          if (msg.sender === socket.current.user?.userId && msg.timestamp <= chat.msg.timestamp) return { ...msg, state: 'read' }
          return msg
        });
        console.log('readeded :',readmessages);
        return { ...prev, messages: readmessages }

      })
    }

    function handleDeliveredMessage({ chat }) {

      const lastdelv = chat.msg.timestamp;
      setSelectedChat(prev => {
        if (prev.room === chat.room) {

          const delvmessages = prev.messages.map(msg => {
            if (msg.timestamp <= lastdelv) return { ...msg, state: 'delivered' }
            return msg
          });
          console.log(delvmessages);
          return { ...prev, messages: delvmessages }
        }
        return prev;
      })
    }


    const handleChatUpdate = (chat) => {
      setSelectedChat(prev => {
        if (prev.room === chat.room) {
          const update = prev.messages.map(m => {
            console.log(m, chat.msgId);
            if (m.msgId && (m.msgId === chat.msgId)) { return { ...m, ...chat } }
            return m;
          })
          return { ...prev, messages: update }
        }
        return prev;
      })
    }

    const handleMessageDeleted = (data) => {
      console.log('message delted !', data);
    }

    function handleErrorMsg({ err }) {
      console.log('Errror received !');
      ToastMsg({ type: 'err', msg: err });
    }



    conn.on('online-users', handleOnlineUsers);
    conn.on('offline-users', handleOfflineUsers);
    conn.on('chat-msg', handleChatMsg);
    conn.on('pvt-chat', handlePrivateChat);
    conn.on('grp-chat', handlePrivateChat);
    conn.on('msg-ack', handleMessageAck);
    conn.on('msg-upload-ack', handleUploadAck);
    conn.on('msg-read', handleReadedMessage)
    conn.on('msg-delv', handleDeliveredMessage)
    conn.on('chat-joined', handleNewChatJoin);
    conn.on('user-joined', handleUserJoined)
    conn.on('update-chat', handleChatUpdate);
    conn.on('msg-deleted', handleMessageDeleted)
    conn.on('error', handleErrorMsg)
    conn.on('err', handleErrorMsg)

    return () => {
      conn.off('online-users', handleOnlineUsers);
      conn.off('offline-users', handleOfflineUsers);
      conn.off('chat-msg', handleChatMsg);
      conn.off('pvt-chat', handlePrivateChat);
      conn.off('grp-chat', handlePrivateChat);
      conn.off('msg-ack', handleMessageAck);
      conn.off('msg-upload-ack', handleUploadAck)
      conn.off('msg-read', handleReadedMessage)
      conn.off('msg-delv', handleDeliveredMessage)
      conn.off('chat-joined', handleNewChatJoin);
      conn.off('user-joined', handleUserJoined)
      conn.off('update-chat', handleChatUpdate);
      conn.off('msg-deleted', handleMessageDeleted)
      conn.off('error', handleErrorMsg)
      conn.off('err', handleErrorMsg)
    }
  }, [socket.current, isSocketconnected]);





  const deleteChat = async (room) => {
    try {
      const res = await chat.delete(`group/${room}`);
      if (res.data.success) {
        let data = res.data;
        setChats(prev => {
          return prev.filter(p => p.room !== room);
        })
        setSelectedChat(chats[0]);
        setActiveCont('chat');
        ToastMsg({ msg: data.msg, type: 'success' })
      }
    } catch (error) {
      const data = error.response?.data;
      ToastMsg({ msg: data.err, type: 'err' });
    }
  }



  return (
    <div className="bg-[var(---color-bg)] flex  h-[80vh] max-w-full md:max-w-7xl mx-auto rounded-md   overflow-hidden "
      style={{ boxShadow: "0px 4px 4px 2px var(---color-shadow)" }}>
      {/* User List - only visible on md+ or if activeView is 'users' */}
      <div
        className={`transition-all duration-300 md:w-[40%] ease-in-out w-full md:block 
          ${activeCont === 'chat' && activeView === "users" ? "block" : "hidden"
          } md:border-r border-[var(---color-border)]`}
      >
        <ChatList
          setActiveCont={setActiveCont}

          onSelect={handleSelectChat}
          selectedChat={selectedChat}
        />
      </div>

      {/* Chat Area */}
      <div
        className={`flex flex-col flex-1 h-full transition-all duration-300 ease-in-out bg-[var(--chat-bg)]  text-[var(--chat-text)] 
          ${(activeCont !== 'chat' || activeView === "chat") || window.innerWidth >= 768 ? "block" : "hidden"
          }`}
      >
        <ChatHeader
          activeCont={activeCont}
          chat={selectedChat}
          onBack={() => { activeCont !== 'chat' ? setActiveCont('chat') : setActiveView("users") }}
          setActiveCont={setActiveCont}
          isMobileView={window.innerWidth < 768}
          deleteChat={deleteChat}
        />
        {
          activeCont === 'form' ?
            // <GroupForm />
            <GroupForm2 /> :
            activeCont === 'userlist' ?
              <AddChatList
                users={users}
                onSelect={handleSelectUser}
                selectedUser={selectedUser}
                setActiveCont={setActiveCont}
              />
              :
              activeCont === 'groupDetail'
                && !selectedChat?.isPersonal ?
                <GroupDetails group={selectedChat} setActiveCont={setActiveCont} />
                :
                activeCont === 'invite' ?
                  <InviteUsers
                    group={selectedChat}
                  />
                  :
                  <>
                    <div className="flex-1 overflow-y-auto ">
                      <MessageList
                        messages={selectedChat?.messages || []}
                        chat={selectedChat}
                        onRetry={handleSendMessage}
                        onDelete={deleteMessage}
                      />
                    </div>
                    {selectedChat && <ChatInputV2 onSend={handleSendMessage} />}
                  </>
        }

      </div>
    </div>
  );
};

export default Chat;
