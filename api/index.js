import express from 'express';
import axios from 'axios';
import authRoutes from './Routes/authRoutes.js'
import userRoutes from './Routes/User/userRoutes.js'
import chatRoutes from './Routes/Chat/chatRoutes.js';
import cloudRoutes from './Routes/cloud/cloudRoutes.js';
import cors from 'cors';
import env from 'dotenv';
import cookieParser from 'cookie-parser';
import {Server} from 'socket.io';
import http from 'http';
import VerifySocketAccess from './Middlewares/chat/VerifySocketAccess.js';
import getOnlineUsers from './chat/getOnlineUsers.js';
import initiUser, { handleofflineUser, keepConnection } from './controllers/chat/initUser.js';
import handleReadMessage from './controllers/chat/hanldeReadMessage.js';
import handleChatMessages from './controllers/chat/handleChatMessages.js';
import handleJoinChat from './controllers/chat/handleJoinChat.js';
import handleDeliveredMessage from './controllers/chat/handleDeliverdMessage.js';
import { errorHandler } from './errorLogger.js';
import handleDeleteMessage from './controllers/chat/handleDeletemessage.js';
import validateRoom, { validateRoomAndMember } from './Middlewares/chat/validateRoom.js';
import handleJoinNewChat from './controllers/chat/handleJoinNewChat.js';
import handleDeleteMessageFile from './controllers/chat/handleDeleteMessageFile.js';

env.config();


const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin:'http://localhost:5173',
    credentials:true,
}
app.use(cors(corsOptions));

app.use('/api/auth',authRoutes);
app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/cloud',cloudRoutes);

app.use(errorHandler)


app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    console.log('query : ',req.query);

    try {
        const res1 = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.OAUTH_CLIENT,
            client_secret: process.env.OAUTH_SECRET,
            redirect_uri: 'http://localhost:3000/auth/google/callback',
            grant_type: 'authorization_code',
        });

        const accessToken = res1.data.access_token;

        const res2 = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const user = res2.data;

        console.log('user : ',user);

        res.status(200).send({ message: `welcom ${user.name}`, user: user });
    } catch (error) {
        console.log('error : ',error);
    }
})

const server = http.createServer(app);

export const io = new Server(server,{cors:corsOptions}); 
io.use(VerifySocketAccess);



io.on('connection',async(socket)=>{

    socket.use((packet, next) => {
        const [eventName,...data] = packet;

        const middlewareRegister = [
            {
                middlewareFunc:validateRoom(socket),
                events:['join-chat'],
            },
            {
                middlewareFunc:validateRoomAndMember(socket),
                events:['send-chat'],
            }
        ];

        for (const register of middlewareRegister) {
            if(register.events.includes(eventName)){
                return register.middlewareFunc(data,next)
            }
        }

    

        return next();
    });

    initiUser(socket);
    keepConnection(socket);
    
    socket.on('online-users',async (refresh)=>{
        console.log('client request refresh ',refresh);
        const onlineUsers = await getOnlineUsers();
        console.log(onlineUsers);
        socket.emit('online-users',onlineUsers);
    })



    handleJoinNewChat(socket);
    
    handleJoinChat(socket);

    handleChatMessages(socket);

    handleReadMessage(socket);  // set message status readc

    handleDeliveredMessage(socket);

    handleDeleteMessage(socket);

    handleDeleteMessageFile(socket);

    socket.on('disconnect', () =>{
        console.log('client disconnected',socket.data.user.username);
        handleofflineUser(socket);
    })
})

io.on('connection_error',(err)=>{
    console.log(err);
})

server.listen(3000, () => {
    return console.log('Server running on port : 3000');
})

