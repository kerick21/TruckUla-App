import { describe, it, expect } from 'vitest'
import { createGeohashAlgorithm } from '../src/algorithms/geohash'
import { createETACalculator } from '../src/algorithms/etaCalculator'

describe('Algoritmos', () => {
  describe('Geohash', () => {
    it('debería codificar coordenadas a geohash', () => {
      const geohash = createGeohashAlgorithm()
      const encoded = geohash.encode(40.7128, -74.0060)

      expect(encoded).toBeTruthy()
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('debería decodificar geohash a coordenadas', () => {
      const geohash = createGeohashAlgorithm()
      const encoded = geohash.encode(40.7128, -74.0060)
      const decoded = geohash.decode(encoded)

      expect(decoded).toHaveProperty('lat')
      expect(decoded).toHaveProperty('lon')
      expect(Math.abs(decoded.lat - 40.7128)).toBeLessThan(0.01)
      expect(Math.abs(decoded.lon - (-74.0060))).toBeLessThan(0.01)
    })

    it('debería encontrar vecinos de geohash', () => {
      const geohash = createGeohashAlgorithm()
      const encoded = geohash.encode(40.7128, -74.0060)
      const neighbors = geohash.neighbors(encoded)

      expect(neighbors).toHaveProperty('n')
      expect(neighbors).toHaveProperty('s')
      expect(neighbors).toHaveProperty('e')
      expect(neighbors).toHaveProperty('w')
    })
  })

  describe('ETA Calculator', () => {
    it('debería calcular ETA básico', () => {
      const calculator = createETACalculator()
      const result = calculator.calculateETA({
        distance: 10, // 10 km
        baseSpeed: 60, // 60 km/h
        trafficConditions: [],
        timeOfDay: new Date(),
        dayOfWeek: 3, // Miércoles
      })

      expect(result).toHaveProperty('eta')
      expect(result).toHaveProperty('confidence')
      expect(result.eta).toBeGreaterThan(0)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('debería aplicar factor de tráfico', () => {
      const calculator = createETACalculator()

      const etaLibre = calculator.calculateETA({
        distance: 10,
        baseSpeed: 60,
        trafficConditions: [{ congestionLevel: 'free', avgSpeed: 60 }],
        timeOfDay: new Date(),
        dayOfWeek: 3,
      })

      const etaCongestionada = calculator.calculateETA({
        distance: 10,
        baseSpeed: 60,
        trafficConditions: [{ congestionLevel: 'congested', avgSpeed: 20 }],
        timeOfDay: new Date(),
        dayOfWeek: 3,
      })

      expect(etaCongestionada.eta).toBeGreaterThan(etaLibre.eta)
    })

    it('debería calcular rango de ETA', () => {
      const calculator = createETACalculator()
      const range = calculator.calculateETARange({
        distance: 10,
        baseSpeed: 60,
        trafficConditions: [],
        timeOfDay: new Date(),
        dayOfWeek: 3,
      })

      expect(range).toHaveProperty('min')
      expect(range).toHaveProperty('max')
      expect(range).toHaveProperty('estimated')
      expect(range.min).toBeLessThanOrEqual(range.estimated)
      expect(range.estimated).toBeLessThanOrEqual(range.max)
    })
  })
})
