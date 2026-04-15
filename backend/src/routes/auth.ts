import { Router } from 'express'
import { authService } from '../services/authService'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json(user)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body
    const result = await authService.refreshToken(token)
    res.json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body
    const decoded = await authService.verifyToken(token)
    res.json({ valid: true, user: decoded })
  } catch (error: any) {
    res.status(401).json({ valid: false, error: error.message })
  }
})

export default router
