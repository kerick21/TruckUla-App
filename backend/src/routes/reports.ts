import { Router } from 'express'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { type, lat, lon, description, userId } = req.body
    
    // Validar tipo de reporte
    const validTypes = ['police', 'accident', 'hazard', 'pothole', 'traffic']
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Tipo de reporte inválido' })
    }

    // En producción, guardar en MongoDB
    const report = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      lat,
      lon,
      description,
      userId,
      createdAt: new Date(),
      votes: 1,
    }

    res.status(201).json(report)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const { minLat, minLon, maxLat, maxLon, type } = req.query
    
    // En producción, usar MongoDB con geoqueries
    res.json({
      reports: [],
      timestamp: new Date(),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params
    const { userId, vote } = req.body
    
    // En producción, actualizar en MongoDB
    res.json({ success: true, message: 'Voto registrado' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
