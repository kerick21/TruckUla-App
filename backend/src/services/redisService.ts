import { createClient, RedisClientType } from 'redis'

export class RedisService {
  private client: RedisClientType

  constructor(url: string) {
    this.client = createClient({ url })
  }

  async connect() {
    await this.client.connect()
    console.log('Redis conectado')
  }

  async disconnect() {
    await this.client.disconnect()
  }

  // Cache de rutas
  async cacheRoute(key: string, route: any, ttl: number = 3600) {
    await this.client.setEx(key, ttl, JSON.stringify(route))
  }

  async getRoute(key: string) {
    const data = await this.client.get(key)
    return data ? JSON.parse(data) : null
  }

  // Ubicaciones en tiempo real
  async setUserLocation(userId: string, location: any, ttl: number = 300) {
    await this.client.setEx(`location:${userId}`, ttl, JSON.stringify(location))
  }

  async getUserLocation(userId: string) {
    const data = await this.client.get(`location:${userId}`)
    return data ? JSON.parse(data) : null
  }

  async getAllUserLocations() {
    const keys = await this.client.keys('location:*')
    const locations = []

    for (const key of keys) {
      const data = await this.client.get(key)
      if (data) locations.push(JSON.parse(data))
    }

    return locations
  }

  // Datos de tráfico
  async setTrafficData(lat: number, lon: number, data: any, ttl: number = 600) {
    const key = `traffic:${lat}:${lon}`
    await this.client.setEx(key, ttl, JSON.stringify(data))
  }

  async getTrafficData(lat: number, lon: number) {
    const key = `traffic:${lat}:${lon}`
    const data = await this.client.get(key)
    return data ? JSON.parse(data) : null
  }

  // Pub/Sub para broadcast
  async publish(channel: string, message: any) {
    await this.client.publish(channel, JSON.stringify(message))
  }

  async subscribe(channel: string, callback: (message: any) => void) {
    const subscriber = this.client.duplicate()
    await subscriber.connect()

    await subscriber.subscribe(channel, (message) => {
      try {
        callback(JSON.parse(message))
      } catch (err) {
        console.error('Error parsing Redis message:', err)
      }
    })

    return subscriber
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.client.incr(key)
    
    if (current === 1) {
      await this.client.expire(key, window)
    }

    return current <= limit
  }

  // Sesiones
  async setSession(sessionId: string, data: any, ttl: number = 86400) {
    await this.client.setEx(`session:${sessionId}`, ttl, JSON.stringify(data))
  }

  async getSession(sessionId: string) {
    const data = await this.client.get(`session:${sessionId}`)
    return data ? JSON.parse(data) : null
  }

  async deleteSession(sessionId: string) {
    await this.client.del(`session:${sessionId}`)
  }
}

export const createRedisService = (url: string) => new RedisService(url)
