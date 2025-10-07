import Message from "../../models/chatModels/message.js";
import chatgroup from "../../models/chatModels/chatgroup.js";
import users from '../../models/user.js';
import { safeHandler } from "../../Middlewares/safeHandler.js";
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

export async function JoinChat(socket,room,roomData) { 
    // create as funtion to join chat if request as new-chat 

    const fromUser = socket.data.user.userId;
    if(!roomData.members.includes(fromUser)){
        return socket.emit('err',{err:'Invalid member request !'});
    }


    leavePreviousRoom(socket); // leave previous room before joining new

    socket.join(room);


    console.log(`${socket.data.user.username} joined room ${room}`);

    const updateRead = await Message.updateMany(
        {
            room: room,
            receiver: fromUser,
            state: { $in: ['sent', 'delivered'] },
        },
        [
            {
                $set: {
                    state: 'read',
                }
            }
        ]
    );

    const chats = await Message.aggregate([
        {
            $match: {
                $expr: {
                    $and: [
                        { $eq: ['$room', room] },
                    ]

                }
            },
        },
        {
            $lookup: {
                from: 'chatimages',
                let: { image: '$images' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ['$_id', '$$image.file'] }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            filename: 1,
                            file: "$cloudId"

                        }
                    }
                ],
                as: 'images'
            }
        },
        {
            $addFields: {
                isSender: { $eq: ["$sender", fromUser] },
                text: {
                    $cond: [{ $eq: ['$state', 'deleted'] },
                    {
                        $cond: [
                            { $eq: ['$sender', fromUser] },
                            'You deleted this message !',
                            'This message was deleted !'
                        ]
                    }
                        , '$text']
                },
                images: {
                    $cond: [{ $eq: ['$state', 'deleted'] }, '$$REMOVE', '$images']
                },
                msgId: '$_id'
            }
        },
        {
            $project: {
                _id: 0, __v: 0,
            }
        }
    ]);

    socket.emit('chat-msg', chats);

    socket.to(room).emit("user-joined", {
        userId: fromUser,
        room: room,
        username: socket.data.user.username,
        msg: `${socket.data.user.username} just joined the room`
    })
}

export default function handleJoinChat(socket) {

    socket.on('join-chat', safeHandler(socket, async (data) => {

        const { room, roomData } = data;
        JoinChat(socket,room,roomData);

    }))
}