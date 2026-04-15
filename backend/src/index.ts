import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { config } from 'dotenv'

// Importar rutas
import authRoutes from './routes/auth'
import routingRoutes from './routes/routing'
import trafficRoutes from './routes/traffic'
import reportsRoutes from './routes/reports'
import locationRoutes from './routes/location'
import searchRoutes from './routes/search'

config()

const logger = pino()
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(pinoHttp({ logger }))

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/routing', routingRoutes)
app.use('/api/traffic', trafficRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/location', locationRoutes)
app.use('/api/search', searchRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// WebSocket
io.on('connection', (socket) => {
  logger.info(`Usuario conectado: ${socket.id}`)

  socket.on('location-update', (data) => {
    io.emit('location-update', data)
  })

  socket.on('report', (data) => {
    io.emit('report', data)
  })

  socket.on('disconnect', () => {
    logger.info(`Usuario desconectado: ${socket.id}`)
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err)
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  })
})

const PORT = process.env.API_PORT || 3000
httpServer.listen(PORT, () => {
  logger.info(`Servidor escuchando en puerto ${PORT}`)
})

export { app, io }
