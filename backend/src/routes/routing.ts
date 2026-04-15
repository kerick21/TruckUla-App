import { Router } from 'express'
import { routingService } from '../services/routingService'

const router = Router()

router.get('/calculate', async (req, res) => {
  try {
    const { origin, destination } = req.query
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin y destination requeridos' })
    }

    const route = await routingService.calculateRoute({
      origin: origin as string,
      destination: destination as string,
    })

    res.json(route)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/eta', async (req, res) => {
  try {
    const { origin, destination, trafficFactor } = req.query
    
    const eta = await routingService.calculateETA(
      origin as string,
      destination as string,
      trafficFactor ? parseFloat(trafficFactor as string) : 1
    )

    res.json({ eta, minutes: eta })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/alternatives', async (req, res) => {
  try {
    const { origin, destination } = req.query
    
    const routes = await routingService.getAlternativeRoutes(
      origin as string,
      destination as string
    )

    res.json(routes)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
