import { Redis } from '@upstash/redis'

// Initialize Redis client with Upstash credentials from environment variables
const redis = new Redis({
  url: process.env.UPST_REDIS_REST_URL,  // Upstash Redis URL
  token: process.env.UPST_REDIS_REST_TOKEN, // Upstash Redis Token
})

// Function to check connection
const checkConnection = async () => {
  try {
    // Perform a simple Redis command to ensure the connection is working
    const pong = await redis.ping(); 
    console.log('Redis Ping Response:', pong);  // Should return 'PONG'
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
}

// Check connection immediately after initialization
checkConnection();

export default redis;