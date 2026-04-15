import axios from 'axios'

interface RouteRequest {
  origin: string
  destination: string
  alternatives?: boolean
  steps?: boolean
  geometries?: 'geojson' | 'polyline'
}

interface RouteResponse {
  distance: number
  duration: number
  geometry: any
  steps: any[]
  eta: string
}

export class RoutingService {
  private osrmUrl = 'http://router.project-osrm.org/route/v1/driving'
  private mapboxToken = process.env.VITE_MAPBOX_TOKEN

  async calculateRoute(request: RouteRequest): Promise<RouteResponse> {
    try {
      // Usar OSRM (gratuito)
      const [originLat, originLon] = request.origin.split(',')
      const [destLat, destLon] = request.destination.split(',')

      const url = `${this.osrmUrl}/${originLon},${originLat};${destLon},${destLat}`
      const params = {
        overview: 'full',
        steps: request.steps !== false,
        geometries: request.geometries || 'geojson',
        alternatives: request.alternatives !== false,
      }

      const response = await axios.get(url, { params })
      const route = response.data.routes[0]

      // Calcular ETA
      const eta = new Date(Date.now() + route.duration * 1000)

      return {
        distance: route.distance / 1000, // Convertir a km
        duration: Math.round(route.duration / 60), // Convertir a minutos
        geometry: route.geometry,
        steps: route.legs[0].steps || [],
        eta: eta.toISOString(),
      }
    } catch (error) {
      throw new Error('Error calculando ruta')
    }
  }

  async calculateETA(
    origin: string,
    destination: string,
    trafficFactor: number = 1
  ): Promise<number> {
    const route = await this.calculateRoute({ origin, destination })
    return Math.round(route.duration * trafficFactor)
  }

  async getAlternativeRoutes(origin: string, destination: string) {
    const response = await this.calculateRoute({
      origin,
      destination,
      alternatives: true,
    })
    return response
  }
}

export const routingService = new RoutingService()
