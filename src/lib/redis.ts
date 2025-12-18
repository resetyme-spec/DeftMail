import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient> | null = null

try {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  })

  redisClient.on('error', (err) => {
    console.warn('Redis Client Error (running without Redis):', err.message)
  })

  redisClient.on('connect', () => console.log('Redis Client Connected'))

  // Connect to Redis (fail gracefully if not available)
  if (!redisClient.isOpen) {
    redisClient.connect().catch((err) => {
      console.warn('Redis not available, running without cache:', err.message)
      redisClient = null
    })
  }
} catch (error) {
  console.warn('Redis not configured, running without cache')
  redisClient = null
}

export { redisClient }
