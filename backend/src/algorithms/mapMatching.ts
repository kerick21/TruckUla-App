interface GPSPoint {
  lat: number
  lon: number
  timestamp: number
}

interface RoadSegment {
  id: string
  startLat: number
  startLon: number
  endLat: number
  endLon: number
}

interface MatchedPoint {
  gpsPoint: GPSPoint
  roadSegment: RoadSegment
  distance: number
}

export class MapMatchingAlgorithm {
  private roadSegments: RoadSegment[] = []

  addRoadSegment(segment: RoadSegment) {
    this.roadSegments.push(segment)
  }

  private distanceToSegment(point: GPSPoint, segment: RoadSegment): number {
    // Calcular distancia de un punto a un segmento de línea
    const x0 = point.lon
    const y0 = point.lat
    const x1 = segment.startLon
    const y1 = segment.startLat
    const x2 = segment.endLon
    const y2 = segment.endLat

    const numerator = Math.abs(
      (y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1
    )
    const denominator = Math.sqrt(
      Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)
    )

    return numerator / denominator
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  matchTrajectory(gpsPoints: GPSPoint[]): MatchedPoint[] {
    const matched: MatchedPoint[] = []

    for (const point of gpsPoints) {
      let bestSegment: RoadSegment | null = null
      let bestDistance = Infinity

      for (const segment of this.roadSegments) {
        const distance = this.distanceToSegment(point, segment)

        if (distance < bestDistance) {
          bestDistance = distance
          bestSegment = segment
        }
      }

      if (bestSegment && bestDistance < 0.05) {
        // 50 metros de tolerancia
        matched.push({
          gpsPoint: point,
          roadSegment: bestSegment,
          distance: bestDistance,
        })
      }
    }

    return matched
  }

  snapToRoad(point: GPSPoint): RoadSegment | null {
    let bestSegment: RoadSegment | null = null
    let bestDistance = Infinity

    for (const segment of this.roadSegments) {
      const distance = this.distanceToSegment(point, segment)

      if (distance < bestDistance) {
        bestDistance = distance
        bestSegment = segment
      }
    }

    return bestDistance < 0.1 ? bestSegment : null // 100 metros
  }
}

export const createMapMatchingAlgorithm = () => new MapMatchingAlgorithm()
