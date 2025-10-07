
import getOnlineUsers, { getUserSocket } from '../../chat/getOnlineUsers.js';
import groupmessage from '../../models/chatModels/groupmessage.js';
import Message from '../../models/chatModels/message.js'
import getMembersFromRedisCache from './util/getMembersFromRedis.js';
import {io} from '../../index.js';

const isUserInRoom = (socketId,room) =>{
   if(!socketId) return false;

   const socket = io.sockets.sockets.get(socketId);
   return socket ? socket.rooms.has(room) : false
}

async function emitMessage({room, message, from,personal}) {
   const members = await getMembersFromRedisCache(room);
   const onlineList = await getOnlineUsers();

   console.log('redisMember',members);

  for (const userId of members) {
    if (userId === from) continue;

    const isOnline = onlineList.includes(userId);
    const socketId = await getUserSocket(userId)

    console.log(isOnline,socketId);

    if (isOnline && socketId && !isUserInRoom(socketId,room)) {
      io.to(socketId).emit(
         personal ? "pvt-chat" : 'grp-chat', 
         {
            room,
            msg:message
         }
      );
    }
  }
}


export default function handleChatMessages(socket) {
   socket.on('send-chat',async(data)=>{
      
      const  {room,roomData,pid,text,images} = data;
      const sender = socket.data.user.userId;
      
      
      
      if(!pid  || !text || text.length === 0){
         socket.emit('error',{err:'chat msg is empty write some text ..'});
         return;
      }

      let message = {
            room,
            sender:sender,
            text,
            pid,
            state:'sent'
      }

      if(images && images.length > 0) {
         const chatImg = images.map(img=>({file:null,filename:img}));
         message = {
            ...message,
            images:chatImg,
            state:'uploading'
         }
      }

      if(roomData.type === 'personal'){  // private chat
         message = {
            ...message,
            receiver:roomData.members.find(m => m!==sender)
         };

         const newMessage = new Message(message);
         const savedMsg = await newMessage.save();
         const {_id,receiver,...Msg} = savedMsg.toObject();
         Msg.msgId= _id;

         // acknowledge the sender 
         socket.emit('msg-ack',{room,msg:{...Msg,pid}})

         // send to all are currently joined in room except sender 
         socket.to(room).emit('pvt-chat',{room,msg:Msg}); 

        
         // emit the messages to online members but not in this room 
         emitMessage({
            room,
            message:Msg,
            from:sender,
            personal:true,
         })
      }
      else{ // group chat

         const newMessage = new groupmessage(message);
         const savedMsg = await newMessage.save();
         const {_id,receiver,...Msg} = savedMsg.toObject();
         Msg.msgId = _id;
         // broadcast to all are currently joined in room
         io.to(room).emit('grp-chat',{room,msg:{...Msg,from:socket.data.user}});

   
         // emit the messages to online members but not in this room 
         emitMessage({
            room,
            message:Msg,
            from:sender,
            personal:false
         })
      }
   })
}
