import redis from "../../redis/redisClient.js";



export default async function initiUser(socket) {
    const {user} = socket.data;

    socket.emit('connected', { user: user });
   
    const key_ = `user:${user.userId}`;
    await redis.hSet(key_,{
        userId:user.userId,
        socket:socket.id
    })
    await redis.expire(key_,90)
    socket.broadcast.emit('online-users', [user.userId]);

}

export async function handleofflineUser(socket) {
    const {user} = socket.data;

    await redis.del(`user:${user.userId}`);
    socket.broadcast.emit('offline-users', { user});
    console.log('client disconnected', user.username);
    socket.data.user = null;
}

export async function keepConnection(socket){
    const {user} = socket.data;

    socket.on('keep-conn',async()=>{
        const key_ = `user:${user.userId}`;
        await redis.hSet(key_,{
            userId:user.userId,
            socket:socket.id
         })
        await redis.expire(key_,90)
        
   
        console.log('online list updated ');
    })
}