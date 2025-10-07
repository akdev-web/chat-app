// redisClient.js
import { createClient } from 'redis';

const redis = createClient({
  url: 'redis://localhost:6379' // This connects to your Docker Redis
});

redis.on('error', (err) => console.error('❌ Redis Client Error:', err));
redis.on('connect',()=> console.log('Connected ot redis server '));
redis.on('reconnecting',()=> console.log('Redis trying to reconnect '))

await redis.connect();


export default redis;
