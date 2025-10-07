
import chatgroup from "../../models/chatModels/chatgroup.js";
import users from '../../models/user.js';
import { safeHandler } from "../../Middlewares/safeHandler.js";
import { JoinChat } from "./handleJoinChat.js";
const getPriveteRoom = (user1, user2) => {
    return [user1, user2].sort().join("_");
};

function leavePreviousRoom(socket) {
    const rooms = socket.rooms;
    for (const room of rooms) {
        if (room !== socket.id) {
            socket.leave(room);
            console.log(`${socket.data.user.username} leaved room ${room}`);
        }
    }
}
export default function handleJoinNewChat(socket) {

    socket.on('new-chat', safeHandler(socket, async (data) => {

        const {user} = data;

        if(!user) return socket.emit('err',{err:'Invalid or No user selected to start new chat !'});
        console.log('joining new chat',user);

        const fromUser = socket.data.user.userId;
        const toUser = user.userId ;
        const room = getPriveteRoom(toUser, fromUser);
        
    

        const isRoomExists = await chatgroup.findOne({ room });
        if(isRoomExists) { 
            return await JoinChat(socket,room,isRoomExists)
        }

        const chatwith = await users.findOne({ liveId: toUser }, { _id: 0, username: 1, userId: "$liveId", profile: "$profile.url" })

        if (!chatwith) {
            socket.emit('error', {
                msg: 'invalid request '
            })
            return;
        }
        const newgroup = new chatgroup({
            members: [toUser, fromUser],
            room,
            name: 'privateChat',
            type: "personal"
        });

        const group = await newgroup.save();

        const newChat = {
            room: group.room,
            group: group.type,
            isPersonal: group.type === 'personal' ? true : false,
            user: {
                name: chatwith.username,
                profile: chatwith.profile
            },
            lastchat: {
                text: 'No message yet',
                timestamp: null,
            }
        }

        leavePreviousRoom(socket); // leave previous room before joining new
        socket.join(room);

        socket.emit('chat-joined', newChat);



        console.log(`${socket.data.user.username} joined room ${room}`);


    }))
}