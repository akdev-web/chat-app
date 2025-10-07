import getOnlineUsers, { getUserSocket } from "../../../chat/getOnlineUsers.js";
import getMembersFromRedisCache from "./getMembersFromRedis.js";
import {io} from '../../../index.js';

const isUserInRoom = (socketId,room) =>{
   if(!socketId) return false;

   const socket = io.sockets.sockets.get(socketId);
   return socket ? socket.rooms.has(room) : false
}

export async function emitMessage({room, message, from,personal}) {
   const members = await getMembersFromRedisCache(room);
   const onlineList = await getOnlineUsers();


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

export async function emitMessageUpdate({room, message, from}) {
   const members = await getMembersFromRedisCache(room);
   const onlineList = await getOnlineUsers();


  for (const userId of members) {
    if (userId === from) continue;

    const isOnline = onlineList.includes(userId);
    const socketId = await getUserSocket(userId)

    console.log(isOnline,socketId);

    if (isOnline && socketId && !isUserInRoom(socketId,room)) {
      io.to(socketId).emit(
         'update-chat', 
         {
            room,
            msg:message
         }
      );
    }
  }
}
