import { describe, it, expect, vi } from 'vitest'
import { routingService } from '../src/services/routingService'

describe('RoutingService', () => {
  describe('calculateRoute', () => {
    it('debería calcular una ruta válida', async () => {
      // Mock de OSRM
      const result = await routingService.calculateRoute({
        origin: '40.7128,-74.0060', // Nueva York
        destination: '34.0522,-118.2437', // Los Ángeles
      })

      expect(result).toHaveProperty('distance')
      expect(result).toHaveProperty('duration')
      expect(result).toHaveProperty('geometry')
      expect(result.distance).toBeGreaterThan(0)
      expect(result.duration).toBeGreaterThan(0)
    })

    it('debería retornar ETA', async () => {
      const result = await routingService.calculateRoute({
        origin: '40.7128,-74.0060',
        destination: '34.0522,-118.2437',
      })

      expect(result).toHaveProperty('eta')
      expect(new Date(result.eta)).toBeInstanceOf(Date)
    })
  })

  describe('calculateETA', () => {
    it('debería calcular ETA en minutos', async () => {
      const eta = await routingService.calculateETA(
        '40.7128,-74.0060',
        '34.0522,-118.2437',
        1.0
      )

      expect(typeof eta).toBe('number')
      expect(eta).toBeGreaterThan(0)
    })

    it('debería aplicar factor de tráfico', async () => {
      const etaNormal = await routingService.calculateETA(
        '40.7128,-74.0060',
        '34.0522,-118.2437',
        1.0
      )

      const etaConTrafico = await routingService.calculateETA(
        '40.7128,-74.0060',
        '34.0522,-118.2437',
        1.5
      )

      expect(etaConTrafico).toBeGreaterThan(etaNormal)
    })
  })
})
