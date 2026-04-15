import { Router } from 'express'

const router = Router()

router.post('/report', async (req, res) => {
  try {
    const { lat, lon, speed, userId } = req.body
    
    // En producción, guardar en Redis/BD
    res.json({ 
      success: true, 
      message: 'Tráfico reportado',
      data: { lat, lon, speed, timestamp: new Date() }
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/data', async (req, res) => {
  try {
    const { lat, lon } = req.query
    
    // En producción, obtener de Redis/BD
    res.json({
      lat: parseFloat(lat as string),
      lon: parseFloat(lon as string),
      avgSpeed: 45,
      congestionLevel: 'free',
      lastUpdate: new Date(),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/area', async (req, res) => {
  try {
    const { minLat, minLon, maxLat, maxLon } = req.query
    
    // En producción, usar PostGIS
    res.json({
      segments: [],
      timestamp: new Date(),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
