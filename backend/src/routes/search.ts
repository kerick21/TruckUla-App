import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/geocode', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q) {
      return res.status(400).json({ error: 'Query requerido' })
    }

    // Usar OpenStreetMap Nominatim (gratuito)
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q,
        format: 'json',
        limit: 5,
        countrycodes: 'us', // Solo EE.UU.
      },
    })

    const results = response.data.map((item: any) => ({
      name: item.name,
      address: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }))

    res.json(results)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query
    
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json',
      },
    })

    res.json({
      address: response.data.address,
      lat: response.data.lat,
      lon: response.data.lon,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/autocomplete', async (req, res) => {
  try {
    const { q, lat, lon } = req.query
    
    // En producción, usar Mapbox Geocoding API
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q,
        format: 'json',
        limit: 10,
        countrycodes: 'us',
      },
    })

    const results = response.data.map((item: any) => ({
      name: item.name,
      address: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }))

    res.json(results)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
