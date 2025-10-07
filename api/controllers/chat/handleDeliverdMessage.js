import message from "../../models/chatModels/message.js";
import { io } from "../../index.js";
import getOnlineUsers, { getUserSocket } from "../../chat/getOnlineUsers.js";
import getMembersFromRedisCache from "./util/getMembersFromRedis.js";
const isUserInRoom = (socketId,room) =>{
   if(!socketId) return false;

   const socket = io.sockets.sockets.get(socketId);
   return socket ? socket.rooms.has(room) : false
}

async function emitMessage(room,chat,from) {
   const members = await getMembersFromRedisCache(room);
   const onlineList = await getOnlineUsers();

   console.log('redisMember',members);

  for (const userId of members) {
    if (userId === from) continue;

    const isOnline = onlineList.includes(userId);
    const socketId = await getUserSocket(userId)

    console.log(isOnline,socketId);

    if (isOnline && socketId && !isUserInRoom(socketId,room)) {
      io.to(socketId).emit('msg-delv',{chat});
    }
  }
}

export default async function handleDeliverdMessage(socket) {
    const { user } = socket.data;
    try {
        socket.on('delv-msg', async ({ chat }) => 
        {
 

            const room =  chat.room;
            const updatedelivered = await message.updateMany(
                {
                    room:room,
                    receiver: user.userId,
                    state:'sent',
                },
                [
                    {
                        $set: {
                            state:'delivered'
                        }
                    }
                ]
            );
            socket.to(room).emit('msg-delv',{chat});
            emitMessage(room,chat,user.userId)
        })
    } catch (error) {
        console.log(error);
    }
}