import { Redis } from 'redis'

interface TrafficData {
  lat: number
  lon: number
  speed: number
  timestamp: number
  userId: string
}

interface TrafficSegment {
  lat: number
  lon: number
  avgSpeed: number
  maxSpeed: number
  minSpeed: number
  congestionLevel: 'free' | 'slow' | 'congested' | 'stopped'
}

export class TrafficService {
  private redis: Redis

  constructor(redis: Redis) {
    this.redis = redis
  }

  async recordTraffic(data: TrafficData): Promise<void> {
    const key = `traffic:${data.lat}:${data.lon}`
    
    // Guardar en Redis con expiración de 1 hora
    await this.redis.lpush(key, JSON.stringify(data))
    await this.redis.expire(key, 3600)
  }

  async getTrafficData(lat: number, lon: number): Promise<TrafficSegment | null> {
    const key = `traffic:${lat}:${lon}`
    const data = await this.redis.lrange(key, 0, -1)

    if (data.length === 0) return null

    const speeds = data.map((d) => JSON.parse(d).speed)
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length
    const maxSpeed = Math.max(...speeds)
    const minSpeed = Math.min(...speeds)

    // Determinar nivel de congestión
    let congestionLevel: TrafficSegment['congestionLevel'] = 'free'
    if (avgSpeed < 10) congestionLevel = 'stopped'
    else if (avgSpeed < 20) congestionLevel = 'congested'
    else if (avgSpeed < 40) congestionLevel = 'slow'

    return {
      lat,
      lon,
      avgSpeed: Math.round(avgSpeed),
      maxSpeed,
      minSpeed,
      congestionLevel,
    }
  }

  async getTrafficInArea(
    minLat: number,
    minLon: number,
    maxLat: number,
    maxLon: number
  ): Promise<TrafficSegment[]> {
    // En producción, usar PostGIS para queries geoespaciales
    const segments: TrafficSegment[] = []
    
    for (let lat = minLat; lat <= maxLat; lat += 0.01) {
      for (let lon = minLon; lon <= maxLon; lon += 0.01) {
        const data = await this.getTrafficData(lat, lon)
        if (data) segments.push(data)
      }
    }

    return segments
  }

  calculateTrafficFactor(congestionLevel: string): number {
    switch (congestionLevel) {
      case 'free':
        return 1.0
      case 'slow':
        return 1.3
      case 'congested':
        return 1.6
      case 'stopped':
        return 2.0
      default:
        return 1.0
    }
  }
}

export const createTrafficService = (redis: Redis) => new TrafficService(redis)
