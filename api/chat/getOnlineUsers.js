
import redis from "../redis/redisClient.js";
export default async function getOnlineUsers() {
  let cursor = "0";               // Used to paginate through Redis keys
  const onlineUsers = [];       // Store final user objects here

  try {
      do {
        const reply = await redis.scan(cursor, {
          MATCH: 'user:*',        // Match only keys that start with 'online:'
          COUNT: 20                // Try fetching 20 keys at a time
        });
        cursor = reply.cursor;      // Cursor tells Redis where to continue next time
    
        for (const key of reply.keys) {
          
          const userData = await redis.hGetAll(key);       // Get the raw string from Redis
    
          if (userData) {
              onlineUsers.push(userData.userId);
          }
        }
      } while (cursor !== "0");       // If cursor = 0, Redis says "no more keys"
    
  } catch (error) {
    console.log(error);  
  }

  return onlineUsers;
}

export async function getUserSocket(userId){
  const key = `user:${userId}`;
  const user_socket = await redis.hGet(key,'socket');
  if(user_socket){
    return user_socket;
  }  
  return null;
}

